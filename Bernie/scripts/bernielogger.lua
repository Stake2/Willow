print("[Bernie] Bernie-Logger-Module is loading...")

local GLOBAL = GLOBAL or _G

local serverUrl = "http://localhost:8090/dst"

local currentCycle = -1

local lasthit = { daywalker = nil, daywalker2 = nil, sharkboi = nil }
local bosseswithcounters = { dragonfly = true, klaus = true }
local bosses = { alterguardian_phase3 = true, antlion = true, bearger = true, beequeen = true, crabking = true, daywalker = true, daywalker2 = true, deerclops = true, dragonfly = true, eyeofterror = true, klaus = true, malbatross = true, minotaur = true, moose = true, mutatedbearger = true, mutateddeerclops = true, mutatedwarg = true, shadow_bishop = true, shadow_knight = true, shadow_rook = true, sharkboi = true, stalker_atrium = true, toadstool = true, toadstool_dark = true, twinofterror1 = true, twinofterror2 = true }
local bossesnames = { eyeofterror = "The Eye of Terror", dragonfly = "Mother Dragonfly", moose = "The Moose/Goose", bearger = "Dormant Bearger", mutatedbearger = "Armored Bearger", enraged_klaus = "Vengeful Klaus ⚠", mutateddeerclops = "Crystal Deerclops", twinofterror2 = "Hungry Spazmatism", antlion = "Desert Antlion", toadstool_dark = "Misery Toadstool ⚠", enraged_dragonfly = "Burning Dragonfly ⚠", twinofterror1 = "Seeker Retinazor", stalker_atrium = "Ancient Fuelweaver", sharkboi = "Defiant Frostjaw", mutatedwarg = "Possessed Warg", shadow_knight = "Shadow Knight", shadow_bishop = "Shadow Bishop", beequeen = "Royal Bee Queen", crabking = "Mighty Crab King", deerclops = "Chilling Deerclops", daywalker = "Nightmare Werepig", minotaur = "Ancient Guardian", daywalker2 = "Scrappy Werepig", malbatross = "Flying Malbatross", shadow_rook = "Shadow Rook", klaus = "Wicked Klaus", toadstool = "Grotto Toadstool", alterguardian_phase3 = "Celestial Champion" }
local foodlist = { minotaurhorn = true, deerclops_eyeball = true, mandrake = true, cookedmandrake = true, mandrakesoup = true, gears = true, royal_jelly = true, glommerfuel = true }

local bossenragedtimer = {}
local bossdamage = {}

local function GetUsers()
    if not (GLOBAL.TheWorld and GLOBAL.TheWorld.ismastersim and GLOBAL.TheNet) then return end
    local users = {}
    local client_table = GLOBAL.TheNet:GetClientTable()
    if not client_table then return nil end
    for _, client in ipairs(client_table) do
        if not client.performance then
            users[client.userid] = { name = client.name or "Anônimo", userid = client.userid, prefab = client.prefab or "Desconhecido", admin = client.admin or false }
        end
    end
    return users
end

local function SendRequest(json)
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then return end
    end, "POST", json)
end

local function DoCounterBossEnraged(inst)
    if inst then
        if inst.enraged then
            if not bossenragedtimer[inst.prefab] then
                bossenragedtimer[inst.prefab] = 0
            end
            bossenragedtimer[inst.prefab] = bossenragedtimer[inst.prefab] + 1
        end
    end
end

local function OnPlayerDeath(world, data)
    local inst = data.inst
    if not inst then return end
    if not inst.userid then return end
    local killer = data and data.afflicter or nil
    local cause = data and data.cause
    local killerprefab = nil
    local killername = nil
    if type(killer) == "table" and killer.prefab then
        killerprefab = killer.prefab
        killername = GLOBAL.STRINGS.NAMES[string.upper(killerprefab)] or killerprefab
    end
    local users = GetUsers()
    local jsonEncoded = GLOBAL.json.encode({ key = "playerdeath", value = { victim = inst:GetDisplayName(), userid = inst.userid, prefab = inst.prefab, doer = killername or killerprefab or cause or "Desconhecido", players = users } })
    SendRequest(jsonEncoded)
end

local function OnPlayerRevived(inst, data)
    if not inst then return end
    local users = GetUsers()
    local jsonEncoded = GLOBAL.json.encode({ key = "playerrevive", value = { name = inst:GetDisplayName(), userid = inst.userid, prefab = inst.prefab, players = users } })
    SendRequest(jsonEncoded)
end

local function OnEntityHit(inst, data)
    if data and data.attacker then
        lasthit[inst.prefab] = data.attacker
    end
end

local function OnEntityDeath(ent, data)
    local inst = ent or (data and data.inst) or data
    local cause = data.cause and data.afflicter or lasthit[inst.prefab] or nil
    if bosses[inst.prefab] then
        local victim = inst.prefab
        if victim == "klaus" and not inst:IsUnchained() then return end
        local doer = cause and cause:GetDisplayName() or "Alguém"
        local userid = cause and cause.userid
        if victim == "stalker_atrium" and (doer == nil) then return end
        local players = GetUsers()
        local helpers = bossdamage[inst.GUID]
        if inst.enraged then
            if bossenragedtimer[inst.prefab] > 30 then
                victim = "enraged_" .. victim
            end
        end
        GLOBAL.ExecuteOnAllShards("clientmessage", { name = "Bernie", type = "bernie", message = "★ " .. bossesnames[victim] .. " foi derrotado ★", whisper = false })
        local jsonEncoded = GLOBAL.json.encode({ key = "kill", value = { victim = victim, doer = doer, userid = userid, players = players, helpers = helpers } })
        SendRequest(jsonEncoded)
        bossdamage[inst.GUID] = nil
        if bossenragedtimer[inst.prefab] then
            bossenragedtimer[inst.prefab] = 0
        end
    elseif inst.userid then
        local killer = data and data.afflicter or nil
        local killerprefab = nil
        local killername = nil
        if killer and killer.prefab then
            killerprefab = killer.prefab
            killername = GLOBAL.STRINGS.NAMES[string.upper(killerprefab)] or killerprefab
        end
        local users = GetUsers()
        local jsonEncoded = GLOBAL.json.encode({ key = "playerdeath", value = { victim = inst:GetDisplayName(), userid = inst.userid, prefab = inst.prefab, doer = killername or killerprefab or data.cause or "Desconhecido", players = users } })
        SendRequest(jsonEncoded)
    end
end

local function OnPlayerJoined(inst, player)
    local iscave = GLOBAL.TheWorld:HasTag("cave")
    if player and player.userid then
        local state = GLOBAL.TheWorld.state or nil
        local jsonEncoded = GLOBAL.json.encode({ key = "playershardjoin", value = { name = player:GetDisplayName() or player.name, userid = player.userid, prefab = player.prefab, iscave = iscave, state = state } })
        SendRequest(jsonEncoded)
    end
end

local function OnComponentEater(self)
    local old_Eat = self.Eat
    function self:Eat(food)
        local result = old_Eat(self, food)
        if not (result and food and food.prefab) then return result end
        if foodlist[food.prefab] and self.inst then
            local victim = (food.components and food.components.named and food.components.named.name) or (food.prefab and GLOBAL.STRINGS.NAMES[string.upper(food.prefab)]) or food.prefab
            local doer = self.inst:GetDisplayName() or "Alguém"
            local userid = self.inst.userid
            GLOBAL.ExecuteOnAllShards("clientmessage", { name = "Bernie", type = "bernie", message = doer .. " está comendo " .. victim .. "...", whisper = false })
            local jsonEncoded = GLOBAL.json.encode({ key = "alert", value = { key = "eat", doer = doer, userid = userid, victim = victim } })
            SendRequest(jsonEncoded)
        end
        return result
    end
end

local function OnComponentBurnable(self)
    local old_Ignite = self.Ignite
    function self:Ignite(immediate, source, ...)
        local result = old_Ignite(self, immediate, source, ...)
        if self.inst and self.inst.prefab and source then
            local player = source
            if source.components and source.components.inventoryitem then player = source.components.inventoryitem:GetGrandOwner() or source end
            if player and player:HasTag("player") then
                local victim = (self.inst.components and self.inst.components.named and self.inst.components.named.name) or (self.inst.prefab and GLOBAL.STRINGS.NAMES[string.upper(self.inst.prefab)]) or self.inst.prefab
                local doer = player:GetDisplayName() or "Alguém"
                local userid = player.userid or nil
                local structure = false
                if (self.inst:HasTag("structure")) then structure = true end
                if structure then
                    GLOBAL.ExecuteOnAllShards("clientmessage", { name = "Bernie", type = "bernie", message = doer .. " está queimando " .. victim .. "...", whisper = false })
                end
                local jsonEncoded = GLOBAL.json.encode({ key = "alert", value = { key = "burn", doer = doer, userid = userid, victim = victim, structure = structure } })
                SendRequest(jsonEncoded)
            else
            end
        end
        return result
    end
end

local function OnCycleChange(inst)
    if GLOBAL.TheWorld and GLOBAL.TheWorld:HasTag("cave") then return end
    local cycle = inst.state.cycles
    if currentCycle == cycle then return end
    local users = GetUsers()
    local jsonEncoded = GLOBAL.json.encode({ key = "cycle", value = { states = inst.state, users = users } })
    currentCycle = cycle
    SendRequest(jsonEncoded)
end

local oldNetworking_Announcement = GLOBAL.Networking_Announcement
GLOBAL.Networking_Announcement = function(message, colour, announce_type)
    if GLOBAL.TheWorld and GLOBAL.TheWorld:HasTag("cave") then return end
    local event_key = nil
    local players = GetUsers()
    if not players then return end
    local player = nil
    local register = nil
    if announce_type == "join_game" then
        event_key = "joingame"
        player = message:gsub(" has joined the game.", "")
        for userid, p in pairs(players) do
            if p.name == player then
                if register == nil then register = {} end
                register[userid] = p
            end
        end
    elseif announce_type == "leave_game" then
        event_key = "leavegame"
        player = message:gsub(" has left the game.", "")
    else
        print("[Bernie] Announce Type: " .. announce_type)
    end
    if event_key then
        local maxPlayers = GLOBAL.TheNet:GetDefaultMaxPlayers()
        local content = { name = player, message = message, register = register, players = players, maxplayers = maxPlayers }
        local jsonEncoded = GLOBAL.json.encode({ key = event_key, value = content })
        SendRequest(jsonEncoded)
    end
    return oldNetworking_Announcement(message, colour, announce_type)
end

local function AttackLeaderboard(inst, data)
    if bosses[inst.prefab] and data and data.attacker and data.damage then
        local attacker = data.attacker
        if attacker.userid then
            local victimid = inst.GUID
            local doerid = attacker.userid
            if not bossdamage[victimid] then bossdamage[victimid] = {} end
            if not bossdamage[victimid][doerid] then bossdamage[victimid][doerid] = { name = attacker:GetDisplayName() or "Alguém", damage = 0, userid = doerid } end
            bossdamage[victimid][doerid].damage = bossdamage[victimid][doerid].damage + data.damage
        end
    end
end

for prefab, _ in pairs(bosses) do
    AddPrefabPostInit(prefab, function(inst)
        inst:ListenForEvent("attacked", function(inst, data)
            AttackLeaderboard(inst, data)
        end)
    end)
end

AddSimPostInit(function()
    AddPlayerPostInit(function(inst)
        --inst:ListenForEvent("death", OnPlayerDeath)
        inst:ListenForEvent("ms_respawnedfromghost", OnPlayerRevived)
        inst:ListenForEvent("respawnfromcorpse", OnPlayerRevived)
    end)
end)

AddPrefabPostInit("world", function(inst)
    inst:ListenForEvent("cycleschanged", OnCycleChange)
    inst:ListenForEvent("ms_playerjoined", OnPlayerJoined)
    inst:ListenForEvent("entity_death", OnPlayerDeath)
end)

for boss, _ in pairs(bosses) do
    AddPrefabPostInit(boss, function(inst)
        inst:ListenForEvent("death", OnEntityDeath)
        inst:ListenForEvent("attacked", OnEntityHit)
    end)
end

for boss, _ in pairs(bosseswithcounters) do
    AddPrefabPostInit(boss, function(inst)
        inst:DoPeriodicTask(1, DoCounterBossEnraged)
    end)
end

AddPrefabPostInit("daywalker", function(inst)
    inst:DoTaskInTime(0, function()
        local old_MakeDefeated = inst.MakeDefeated
        function inst:MakeDefeated()
            OnEntityDeath(nil, { inst = inst })
            return old_MakeDefeated(inst)
        end
    end)
end)

AddPrefabPostInit("daywalker2", function(inst)
    inst:DoTaskInTime(0, function()
        local old_MakeDefeated = inst.MakeDefeated
        function inst:MakeDefeated()
            OnEntityDeath(nil, { inst = inst })
            return old_MakeDefeated(inst)
        end
    end)
end)

AddPrefabPostInit("sharkboi", function(inst)
    inst:DoTaskInTime(0, function()
        local old_MakeTrader = inst.MakeTrader
        function inst:MakeTrader()
            OnEntityDeath(nil, { inst = inst })
            return old_MakeTrader(inst)
        end
    end)
end)

AddComponentPostInit("eater", OnComponentEater)
AddComponentPostInit("burnable", OnComponentBurnable)

local _ACTION_HAMMER = GLOBAL.ACTIONS.HAMMER.fn
GLOBAL.ACTIONS.HAMMER.fn = function(act)
    if act.doer and act.target and act.target.components.workable.workleft == 1 then
        if act.doer.userid then
            local structure = false
            if (act.target:HasTag("structure")) then structure = true end
            if structure then
                GLOBAL.ExecuteOnAllShards("clientmessage", { name = "Bernie", type = "bernie", message = act.doer.name .. " está quebrando " .. act.target.name .. "...", whisper = false })
            end
            local jsonEncoded = GLOBAL.json.encode({ key = "alert", value = { key = "break", doer = act.doer.name, userid = act.doer.userid, victim = act.target.name, structure = structure } })
            SendRequest(jsonEncoded)
        end
    end
    return _ACTION_HAMMER(act)
end

print("[Bernie] Bernie-Logger-Module loaded!")
