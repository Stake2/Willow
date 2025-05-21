print("[Bernie] Chat-Manager-Module is loading...")

local GLOBAL = GLOBAL or _G

local serverUrl = "http://localhost:8090/dst"

local fixblacklist = { pighouse = true, rabbithouse = true, monkeyhut = true, monkeybarrel = true, mermhouse_crafted = true, mermhouse = true, mermwatchtower = true, tent = true, siestahut = true, beehive = true, wasphive = true, catcoonden = true, mushroom_farm = true, berrybush = true, berrybush2 = true }

local function SendRequest(json)
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then return end
    end, "POST", json)
end

local function FixCommand(player)
    if not player.components.health or player.components.health:IsDead() or not player.sg then
        player.components.talker:Say("Boo...")
        return
    end
    local x, y, z = player.Transform:GetWorldPosition()
    local radius = 6
    player.sg:GoToState("domediumaction")
    player:DoTaskInTime(.6, function()
        player.sg:GoToState("idle")
        local played_sound = false
        for _, ent in ipairs(GLOBAL.TheSim:FindEntities(x, y, z, radius, { "burnt" }, { "INLIMBO" })) do
            if ent then
                local orig_pos = ent:GetPosition()
                local blacklisted = false
                if fixblacklist[ent.prefab] then blacklisted = true end
                if not blacklisted then
                    ent:Remove()
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

local function SanitizeString(str)
    if type(str) == "string" then
        local newstr = str
        newstr = newstr:gsub("\\", "\\\\"):gsub("\"", "\\\"")
        newstr = newstr:gsub("\n", "\\n"):gsub("\r", "")
        newstr = newstr:gsub("'", "´"):gsub("`", "´")
        return newstr
    end
    return "[Censurado]"
end

local ExecuteCommand = {
    fix = function(value)
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if value.userid == player.userid then
                FixCommand(player)
                break
            end
        end
    end,
    ping = function(value)
        local jsonEncoded = GLOBAL.json.encode({ key = "ping", value = {} })
        SendRequest(jsonEncoded)
    end,
    look = function(value)
        local player = GLOBAL.UserToPlayer(value.userid)
        if not player or not player:IsValid() or not player.sg or not player.AnimState then return end
        if player.components.health and player.components.health:IsDead() then return end
        player:PushEvent("emote", { anim = "look", randomanim = true })
    end,
    tango = function(value)
        local player = GLOBAL.UserToPlayer(value.userid)
        if not player or not player:IsValid() or not player.sg or not player.AnimState then return end
        if player.components.health and player.components.health:IsDead() then return end
        player.sg:GoToState("custom_loop_emote", { anim = "idle_tango_loop" })
    end,
    crabby = function(value)
        local player = GLOBAL.UserToPlayer(value.userid)
        if not player or not player:IsValid() or not player.sg or not player.AnimState then return end
        if player.components.health and player.components.health:IsDead() then return end
        player.sg:GoToState("custom_loop_emote", { anim = "idle_clack_loop" })
    end
}

local function HandleCommands(guid, userid, name, prefab, command, arguments)
    local value = { name = name, guid = guid, userid = userid, prefab = prefab, command = command, arguments = arguments }
    if ExecuteCommand[value.command] then ExecuteCommand[value.command](value) end
    local jsonEncoded = GLOBAL.json.encode({ key = "command", value = { userid = userid, name = SanitizeString(name), prefab = prefab, command = SanitizeString(command), arguments = arguments } })
    SendRequest(jsonEncoded)
end

local function OnSendMessage(guid, userid, name, prefab, message, colour, whisper, isemote, iscave)
    if not whisper then
        if iscave then return end
    end
    local jsonEncoded = GLOBAL.json.encode({ key = "message", value = { userid = userid, name = SanitizeString(name), prefab = prefab, message = SanitizeString(message), whisper = whisper } })
    SendRequest(jsonEncoded)
end

AddSimPostInit(function()
    local old_Networking_Say = GLOBAL.Networking_Say
    GLOBAL.Networking_Say = function(guid, userid, name, prefab, message, colour, whisper, isemote)
        OnSendMessage(guid, userid, name, prefab, message, colour, whisper, isemote, GLOBAL.TheWorld:HasTag("cave"))
        return old_Networking_Say(guid, userid, name, prefab, message, colour, whisper, isemote)
    end
end)

local function OnClientCommand(json, extra)
    if not (GLOBAL.TheWorld) then return end
    if extra then json = extra end
    local value = type(json) == "table" and json or GLOBAL.json.decode(json) or nil
    local player = nil
    for _, v in ipairs(GLOBAL.AllPlayers) do
        if v.userid == value.userid then
            player = v
            break
        end
    end
    if not player then return end
    value.guid = player.GUID or "Unknown"
    value.name = player.name or "Unknown"
    value.prefab = player.prefab or "None"
    HandleCommands(value.guid, value.userid, value.name, value.prefab, value.command, value.arguments)
end

AddStategraphPostInit("wilson", function(sg)
    sg.states["custom_loop_emote"] = GLOBAL.State {
        name = "custom_loop_emote",
        tags = { "idle", "notalking", "nodangle" },
        onenter = function(inst, data)
            if data and data.anim then
                inst.AnimState:PlayAnimation(data.anim, true)
                if inst.SoundEmitter then
                    local voice = inst.talksound or ("dontstarve/characters/" .. (inst.prefab or "wilson") .. "/talk")
                    inst.SoundEmitter:PlaySound(voice, "talk")
                end
            end
        end,
        onexit = function(inst)
        end,
    }
end)

AddModRPCHandler("ashleyservercommand", "message", OnClientCommand)

print("[Bernie] Chat-Manager-Module loaded!")
