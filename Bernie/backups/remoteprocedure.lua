print('[Bernie] Remote-Procedure-Module was loaded!')

local GLOBAL = GLOBAL or _G
local serverUrl = "http://localhost:8090/dst"
local counters = { klaus = 0, shadow_rook = 0, shadow_bishop = 0, shadow_knight = 0, spiderqueen = 0 }
local bosses = { { rabbitking_aggressive = 1 }, { stalker_atrium = 8 }, { alterguardian_phase3 = 12 }, { toadstool = 4 }, { toadstool_dark = 8 }, { worm_boss = 3 }, { spiderqueen = 1 }, { shadow_knight = 2 }, { shadow_bishop = 2 }, { shadow_rook = 2 }, { sharkboi = 2 }, { twinofterror1 = 2 }, { twinofterror2 = 2 }, { eyeofterror = 2 }, { dragonfly = 2 }, { minotaur = 3 }, { lordfruitfly = 2 }, { malbatross = 2 }, { beequeen = 4 }, { daywalker = 2 }, { daywalker2 = 2 }, { crabking = 4 }, { deerclops = 1 }, { moose = 1 }, { antlion = 6 }, { bearger = 4 }, { mutateddeerclops = 3 }, { mutatedwarg = 2 }, { mutatedbearger = 6 }, { klaus = 4 } }
local fixblacklist = { "pighouse", "rabbithouse", "monkeyhut", "monkeybarrel", "mermhouse_crafted", "mermhouse",
    "mermwatchtower", "tent", "beehive", "wasphive", "catcoonden", "mushroom_farm", "berrybush", "berrybush2" }
local currentCycle = -1
local food_list = { "minotaurhorn", "deerclops_eyeball", "mandrake", "cookedmandrake", "mandrakesoup", "gears",
    "royal_jelly", "glommerfuel" }

local function InTable(value, tbl)
    for _, v in ipairs(tbl) do
        if v.userid == value then
            return true
        end
    end
    return false
end

local function SendRequest(json)
    ---@diagnostic disable-next-line: undefined-field
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then
            return
        end
    end, "POST", json)
end

local function GetUsers()
    ---@diagnostic disable-next-line: undefined-field
    if GLOBAL.TheWorld.ismastersim and GLOBAL.TheNet then
        local users = {}
        ---@diagnostic disable-next-line: undefined-field
        local client_table = GLOBAL.TheNet:GetClientTable()
        if client_table then
            for _, client in ipairs(client_table) do
                if not client.performance then
                    users[client.userid] = {
                        name = client.name or nil,
                        userid = client.userid,
                        prefab = client.prefab or
                            nil,
                        admin = client.admin or false,
                        online = true
                    }
                end
            end
        end
        return users
    end
end

local function FixCommand(player)
    local x, y, z = player.Transform:GetWorldPosition()
    local radius = 6
    player.sg:GoToState("domediumaction")
    player:DoTaskInTime(.6, function()
        player.sg:GoToState("idle")
        local played_sound = false
        ---@diagnostic disable-next-line: undefined-field
        for _, ent in ipairs(GLOBAL.TheSim:FindEntities(x, y, z, radius, { "burnt" }, { "INLIMBO" })) do
            if ent then
                local orig_pos = ent:GetPosition()
                local blacklisted = false
                for _, v in ipairs(fixblacklist) do
                    if v == ent.prefab then
                        blacklisted = true
                    end
                end
                if not blacklisted then
                    ent:Remove()
                    ---@diagnostic disable-next-line: undefined-field
                    local new_ent = GLOBAL.SpawnPrefab(ent.prefab, ent.skinname, nil, player.userid)
                    if new_ent then
                        new_ent.Transform:SetPosition(orig_pos:Get())
                        if not played_sound then
                            new_ent.SoundEmitter:PlaySound("dontstarve/common/place_structure_straw")
                            played_sound = true
                        end
                    end
                end
            end
        end
    end)
end

local shardFunctionHandler = function(key, value)
    if key == "fix" then
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if value.userid == player.userid then
                FixCommand(player)
            end
        end
    end
    if key == "playercontroller" then
        ---@diagnostic disable-next-line: undefined-field
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if player.userid == value.userid then
                if value.message then
                    if player.components.talker then
                        player.components.talker:Say(value.message, 3)
                    end
                end
                if value.animation then
                    if player.sg then
                        player:PushEvent("emote", { anim = value.animation })
                    end
                end
                if value.soundeffect then
                    if player.SoundEmitter then
                        player.SoundEmitter:PlaySound(value.soundeffect)
                    end
                end
            end
        end
    end
    if key == "terminal" then
        ---@diagnostic disable-next-line: undefined-field
        GLOBAL.ExecuteConsoleCommand(value.message)
    end
    if key == "kill" then
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if player.SoundEmitter then
                player.SoundEmitter:PlaySound("dontstarve/quagmire/HUD/new_recipe")
            end
            if player.sg and player.sg:HasStateTag("idle") then
                player:PushEvent("emote", { anim = "emote_jumpcheer" })
            end
        end
    end
end

local function ExecuteOnAllShards(key, value)
    if GLOBAL.shardFunctionHandler then
        GLOBAL.shardFunctionHandler(key, value)
    end
    ---@diagnostic disable-next-line: undefined-field
    local shard_id = GLOBAL.TheWorld and GLOBAL.TheWorld.shardid
    ---@diagnostic disable-next-line: undefined-field
    for shard, _ in pairs(GLOBAL.Shard_GetConnectedShards()) do
        if shard ~= shard_id then
            ---@diagnostic disable-next-line: undefined-field
            local json = GLOBAL.json.encode(value)
            ---@diagnostic disable-next-line: undefined-field
            SendModRPCToShard(GetShardModRPC("willow", "ExecuteFunction"), shard, key, json)
        end
    end
end

local function HandleServerResponse(array)
    for _, table in ipairs(array) do
        if table.key then
            if table.key == "message" then
                if (table.value.admin == true) then
                    ---@diagnostic disable-next-line: undefined-field
                    GLOBAL.TheNet:Announce(
                        string.format("[Staff] %s: %s", table.value.user or "Anônimo", table.value.message or "[Segredo]"),
                        nil, nil, "mod")
                else
                    ---@diagnostic disable-next-line: undefined-field
                    GLOBAL.TheNet:Announce(
                        string.format("[Membro] %s: %s", table.value.user or "Anônimo",
                            table.value.message or "[Segredo]"),
                        nil, nil, "mod")
                end
            elseif table.key == "announcement" then
                ---@diagnostic disable-next-line: undefined-field
                GLOBAL.TheNet:Announce(string.format("%s", table.value.message or "[Segredo]"), nil, nil)
            elseif table.key == "playercontroller" then
                ExecuteOnAllShards("playercontroller", table.value)
            elseif table.key == "kick" then
                local users = GetUsers()
                if users and table.value.userid then
                    if InTable(table.value.userid, users) then
                        ---@diagnostic disable-next-line: undefined-field
                        GLOBAL.TheNet:Kick(table.value.userid)
                    end
                end
            elseif table.key == "ban" then
                local users = GetUsers()
                if users and table.value.userid then
                    if InTable(table.value.userid, users) then
                        ---@diagnostic disable-next-line: undefined-field
                        GLOBAL.TheNet:Ban(table.value.userid)
                    end
                end
            elseif table.key == "unban" then
                if table.value.userid then
                    ---@diagnostic disable-next-line: undefined-field
                    GLOBAL.ExecuteConsoleCommand("c_unban(" .. table.value.userid .. ")")
                end
            elseif table.key == "userlist" then
                local users = GetUsers()
                local jsonEncoded = GLOBAL.json.encode({ key = "userlist", value = { users = users, interaction = table.value.interaction } })
                SendRequest(jsonEncoded)
            elseif table.key == "regenerate" then
                ---@diagnostic disable-next-line: undefined-field
                GLOBAL.ExecuteConsoleCommand("c_regenerateworld()")
            elseif table.key == "rollback" then
                ---@diagnostic disable-next-line: undefined-field
                GLOBAL.ExecuteConsoleCommand(string.format("c_rollback(%d)", table.value.quantity))
            elseif table.key == "terminal" then
                ExecuteOnAllShards("terminal", table.value)
            elseif table.key == "ping" then
                ---@diagnostic disable-next-line: undefined-field
                GLOBAL.TheNet:Announce(table.value.message, nil, nil)
            end
        end
    end
end

local function SendUpdateRequest()
    ---@diagnostic disable-next-line: undefined-field
    local jsonClient = GLOBAL.json.encode({ key = "update" })
    ---@diagnostic disable-next-line: undefined-field
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then
            return
        end
        ---@diagnostic disable-next-line: undefined-field
        local jsonServer = GLOBAL.json.decode(result)
        HandleServerResponse(jsonServer)
    end, "POST", jsonClient)
end

local function HandleCommands(guid, userid, name, prefab, message, colour, whisper, isemote)
    local trimmed_message = message:match("^%s*(.-)%s*$")
    local prefix = trimmed_message:sub(1, 1)
    local command = trimmed_message:sub(2)
    local value = { name = name, userid = userid, prefab = prefab, message = message }
    if prefix == ">" then
        if command == "fix" then
            ExecuteOnAllShards("fix", value)
        end
        if command == "ping" then
            ---@diagnostic disable-next-line: undefined-field
            local jsonEncoded = GLOBAL.json.encode({ key = "ping", value = {} })
            SendRequest(jsonEncoded)
        end
        if command == "staff" then
            ---@diagnostic disable-next-line: undefined-field
            local jsonEncoded = GLOBAL.json.encode({ key = "staff", value = { user = value.name, userid = value.userid } })
            SendRequest(jsonEncoded)
        end
    end
end

local function OnCycleChange(inst)
    local cycle = inst.state.cycles
    if currentCycle == cycle then
        return
    end
    local users = GetUsers()
    ---@diagnostic disable-next-line: undefined-field
    local jsonEncoded = GLOBAL.json.encode({ key = "cycle", value = { states = inst.state, users = users } })
    currentCycle = cycle
    SendRequest(jsonEncoded)
end

local function UpdateLoop(inst)
    SendUpdateRequest()
    inst:DoStaticTaskInTime(1, UpdateLoop)
end

local function OnSendMessage(guid, userid, name, prefab, message, colour, whisper, isemote)
    local function SanitizeString(str)
        if type(str) == "string" then
            return str:gsub("\\", "\\\\"):gsub("\"", "\\\""):gsub("\n", "\\n"):gsub("\r", ""):gsub("'", "´"):gsub("`",
                "´")
        end
        return str
    end
    print(guid)
    HandleCommands(guid, userid, name, prefab, message, colour, whisper, isemote)
    ---@diagnostic disable-next-line: undefined-field
    local jsonEncoded = GLOBAL.json.encode({ key = "message", value = { userid = userid, username = SanitizeString(name), prefab = prefab, message = SanitizeString(message), whisper = whisper } })
    SendRequest(jsonEncoded)
end

local function OnPlayerDeath(inst, data)
    if inst then
        local cause = data and data.cause or nil
        local killer = data and data.afflicter or nil
        local killerprefab = nil
        local killername = nil
        if killer then
            if killer.prefab then
                killerprefab = killer.prefab
                ---@diagnostic disable-next-line: undefined-field
                killername = GLOBAL.STRINGS.NAMES[string.upper(killerprefab)] or killerprefab
            end
        end
        local users = GetUsers()
        ---@diagnostic disable-next-line: undefined-field
        GLOBAL.TheNet:Announce(string.format("[Bernie] %s deixou cair 30 oincs...", inst:GetDisplayName()), nil, nil)
        local jsonEncoded = GLOBAL.json.encode({ key = "playerdeath", value = { username = inst:GetDisplayName(), userid = inst.userid, prefab = inst.prefab, cause = killername or killerprefab or "Desconhecido", players = users } })
        SendRequest(jsonEncoded)
    end
end

local function OnPlayerRevived(inst, data)
    if inst then
        local users = GetUsers()
        local reviver = data and data.reviver
        local source = data and data.source
        local cause = data and data.cause
        local source_name = nil
        if source and source.prefab then
            ---@diagnostic disable-next-line: undefined-field
            source_name = GLOBAL.STRINGS.NAMES[string.upper(source.prefab)] or source.prefab
        end
        ---@diagnostic disable-next-line: undefined-field
        local jsonEncoded = GLOBAL.json.encode({ key = "playerrevive", value = { username = inst:GetDisplayName(), prefab = inst.prefab, cause = cause, source = source, reviver = reviver, players = users } })
        SendRequest(jsonEncoded)
    end
end

local function OnEntityDeath(inst, data)
    local inst = data.inst
    local cause = data.cause and data.afflicter or nil
    for _, boss in ipairs(bosses) do
        for prefab, points in pairs(boss) do
            if inst.prefab == prefab then
                if (inst.prefab == "klaus" or inst.prefab == "spiderqueen") then
                    counters[inst.prefab] = counters[inst.prefab] + 1
                    if counters[inst.prefab] == 1 then
                        inst:DoTaskInTime(10 * 60, function()
                            counters[inst.prefab] = 0
                        end)
                        return
                    end
                    counters[inst.prefab] = 0
                end
                if (inst.prefab == 'shadow_rook' or inst.prefab == 'shadow_knight' or inst.prefab == 'shadow_bishop') then
                    counters[inst.prefab] = counters[inst.prefab] + 1
                    if counters[inst.prefab] >= 1 then
                        return
                    end
                    inst:DoTaskInTime(10 * 60, function()
                        counters[inst.prefab] = 0
                    end)
                end
                local victim = inst:GetDisplayName() or "Desconhecido"
                local doer = cause and cause:GetDisplayName() or "Alguém"
                if inst.prefab == "stalker_atrium" and doer == nil then
                    return
                end
                local players = GetUsers()
                local jsonEncoded = GLOBAL.json.encode({ key = "kill", value = { victim = victim, doer = doer, points = points, players = players } })
                ---@diagnostic disable-next-line: undefined-field
                GLOBAL.TheNet:Announce(
                    string.format("★ %s derrotou %s ★\nTodos coletaram 0%d oincs.", doer, victim, points), nil, nil)
                SendRequest(jsonEncoded)
                ExecuteOnAllShards("kill", nil)
            end
        end
    end
end

AddShardModRPCHandler("willow", "RequestPlayers", function(json)
    ---@diagnostic disable-next-line: undefined-field
    local players = GLOBAL.json.decode(json)
    ---@diagnostic disable-next-line: undefined-field
    for _, v in ipairs(GLOBAL.AllPlayers) do
        table.insert(players, { name = v.name, userid = v.userid, prefab = v.prefab })
    end
    ---@diagnostic disable-next-line: undefined-field
    local playersJson = GLOBAL.json.encode({ key = "playerslist", value = players })
    SendRequest(playersJson)
end)

AddShardModRPCHandler("willow", "ExecuteFunction", function(_, key, json)
    if GLOBAL.shardFunctionHandler then
        ---@diagnostic disable-next-line: undefined-field
        local value = GLOBAL.json.decode(json)
        GLOBAL.shardFunctionHandler(key, value)
    end
end)

AddSimPostInit(function()
    ---@diagnostic disable-next-line: undefined-field
    if GLOBAL.TheWorld and not GLOBAL.TheWorld:HasTag("cave") then
        local NETWORKING_SAY = GLOBAL.Networking_Say
        ---@diagnostic disable-next-line: undefined-field
        GLOBAL.Networking_Say = function(guid, userid, name, prefab, message, colour, whisper, isemote)
            OnSendMessage(guid, userid, name, prefab, message, colour, whisper, isemote)
            return NETWORKING_SAY(guid, userid, name, prefab, message, colour, whisper, isemote)
        end
        AddPlayerPostInit(function(inst)
            inst:ListenForEvent("death", OnPlayerDeath)
            inst:ListenForEvent("ms_respawnedfromghost", OnPlayerRevived)
            inst:ListenForEvent("respawnfromcorpse", OnPlayerRevived)
        end)
    end
end)

AddPrefabPostInit("world", function(inst)
    inst:ListenForEvent("entity_death", OnEntityDeath)
    if not inst:HasTag("cave") then
        inst:DoTaskInTime(0, UpdateLoop)
        inst:ListenForEvent("cycleschanged", OnCycleChange)
    end
end)

AddPrefabPostInit("daywalker", function(inst)
    inst:ListenForEvent("onremove", function()
        OnEntityDeath(nil, { inst = inst })
    end)
end)

AddPrefabPostInit("daywalker2", function(inst)
    inst:ListenForEvent("onremove", function()
        OnEntityDeath(nil, { inst = inst })
    end)
end)

AddComponentPostInit("eater", function(self)
    local old_Eat = self.Eat
    function self:Eat(food)
        local result = old_Eat(self, food)
        if result and food and food.prefab then
            for _, prefab in ipairs(food_list) do
                if food.prefab == prefab and self.inst then
                    local food_name = (food.components and food.components.named and food.components.named.name) or
                        ---@diagnostic disable-next-line: undefined-field
                        (food.prefab and GLOBAL.STRINGS.NAMES[string.upper(food.prefab)]) or food.prefab
                    local player_name = self.inst:GetDisplayName() or "Alguém"
                    ---@diagnostic disable-next-line: undefined-field
                    GLOBAL.TheNet:Announce(string.format("[Bernie] %s está comendo %s!", player_name, food_name))
                    ---@diagnostic disable-next-line: undefined-field
                    local jsonEncoded = GLOBAL.json.encode({ key = "alert", value = { key = "eat", doer = player_name, victim = food_name } })
                    SendRequest(jsonEncoded)
                    break
                end
            end
        end
        return result
    end
end)

AddComponentPostInit("burnable", function(self)
    local old_Ignite = self.Ignite
    function self:Ignite(immediate, source, ...)
        local result = old_Ignite(self, immediate, source, ...)
        if self.inst and self.inst.prefab and source then
            local player = source
            if source.components and source.components.inventoryitem then
                player = source.components.inventoryitem:GetGrandOwner() or source
            end
            if player and player:HasTag("player") then
                local item_name = (self.inst.components and self.inst.components.named and self.inst.components.named.name) or
                    ---@diagnostic disable-next-line: undefined-field
                    (self.inst.prefab and GLOBAL.STRINGS.NAMES[string.upper(self.inst.prefab)]) or self.inst.prefab
                local player_name = player:GetDisplayName() or "Alguém"
                if (self.inst:HasTag("structure")) then
                    ---@diagnostic disable-next-line: undefined-field
                    GLOBAL.TheNet:Announce(string.format("[Bernie] %s colocou fogo em %s!", player_name, item_name))
                end
                ---@diagnostic disable-next-line: undefined-field
                local jsonEncoded = GLOBAL.json.encode({ key = "alert", value = { key = "burn", doer = player_name, victim = item_name } })
                SendRequest(jsonEncoded)
            else
            end
        end
        return result
    end
end)

local oldNetworking_Announcement = GLOBAL.Networking_Announcement
GLOBAL.Networking_Announcement = function(message, colour, announce_type)
    if GLOBAL.TheWorld and not GLOBAL.TheWorld:HasTag("cave") then
        local event_key = nil
        local maxPlayers = GLOBAL.TheNet:GetDefaultMaxPlayers()
        if announce_type == "join_game" then
            event_key = "joingame"
        elseif announce_type == "leave_game" then
            event_key = "leavegame"
        elseif (announce_type == "item_drop") then
            event_key = "itemdrop"
        elseif (announce_type == "dice_roll") then
            event_key = "diceroll"
        end
        if event_key then
            local content = {
                message = message,
                type = announce_type,
                players = GetUsers(),
                maxplayers = maxPlayers
            }
            local jsonEncoded = GLOBAL.json.encode({ key = event_key, value = content })
            SendRequest(jsonEncoded)
        end
    end
    return oldNetworking_Announcement(message, colour, announce_type)
end
