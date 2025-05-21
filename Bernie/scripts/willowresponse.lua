print("[Bernie] Willow-Response-Module is loading...")

local GLOBAL = GLOBAL or _G

local serverUrl = "http://localhost:8090/dst"

GLOBAL.AddClientModRPCHandler("ashleyclientmessage", "message", function() end)
local CLIENTMESSAGE_RPC = GLOBAL.GetClientModRPC("ashleyclientmessage", "message")
GLOBAL.AddClientModRPCHandler("ashleyclientannouncement", "message", function() end)
local CLIENTANNOUNCEMENT_RPC = GLOBAL.GetClientModRPC("ashleyclientannouncement", "message")

local function GetUsers()
    if not (GLOBAL.TheWorld.ismastersim and GLOBAL.TheNet) then return end
    local users = {}
    local client_table = GLOBAL.TheNet:GetClientTable()
    if client_table then
        for _, client in ipairs(client_table) do
            if not client.performance then
                users[client.userid] = {
                    name = client.name or nil,
                    userid = client.userid,
                    guid = client.GUID or nil,
                    prefab = client.prefab or nil,
                    admin = client.admin or false
                }
            end
        end
    end
    return users
end

local shardFunctionHandler = function(key, value)
    if key == "playercontroller" then
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if player.userid == value.userid then
                if value.message then
                    if player.components.talker then
                        player.components.talker:Say(value.message, 3)
                    end
                end
                if value.animation then
                    if player.sg and player.sg:HasStateTag("idle") then
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
    elseif key == "terminal" then
        GLOBAL.ExecuteConsoleCommand(value.message)
    elseif key == "kill" then
        for _, player in ipairs(GLOBAL.AllPlayers) do
            if player.SoundEmitter then player.SoundEmitter:PlaySound("dontstarve/quagmire/HUD/new_recipe") end
            if player.sg and player.sg:HasStateTag("idle") then player:PushEvent("emote", { anim = "emote_jumpcheer" }) end
        end
    elseif key == "clientmessage" then
        local users = GetUsers()
        for _, player in pairs(users) do
            if player and player.userid then
                if value.userid then
                    if value.userid == player.userid then
                        local json = GLOBAL.json.encode({ type = value.type, name = value.name, message = value.message })
                        if json then GLOBAL.SendModRPCToClient(CLIENTMESSAGE_RPC, player.userid, json) end
                    end
                else
                    local json = GLOBAL.json.encode({ type = value.type, name = value.name, message = value.message })
                    if json then GLOBAL.SendModRPCToClient(CLIENTMESSAGE_RPC, player.userid, json) end
                end
            end
        end
    elseif key == "clientannouncement" then
        local users = GetUsers()
        for _, player in pairs(users) do
            if player and player.userid then
                if value.userid then
                    if value.userid == player.userid then
                        local json = GLOBAL.json.encode({ type = value.type, title = value.title, description = value.description })
                        if json then GLOBAL.SendModRPCToClient(CLIENTANNOUNCEMENT_RPC, player.userid, json) end
                    end
                else
                    local json = GLOBAL.json.encode({ type = value.type, title = value.title, description = value.description })
                    if json then GLOBAL.SendModRPCToClient(CLIENTANNOUNCEMENT_RPC, player.userid, json) end
                end
            end
        end
    end
end

GLOBAL.ExecuteOnAllShards = function(key, value)
    if shardFunctionHandler then shardFunctionHandler(key, value) end
    local shard_id = GLOBAL.TheWorld and GLOBAL.TheWorld.shardid
    for shard, _ in pairs(GLOBAL.Shard_GetConnectedShards()) do
        if shard ~= shard_id then
            local json = GLOBAL.json.encode(value)
            SendModRPCToShard(GetShardModRPC("bernieshardfunction", "message"), shard, key, json)
        end
    end
end

AddShardModRPCHandler("bernieshardfunction", "message", function(_, key, json)
    if shardFunctionHandler then
        local value = GLOBAL.json.decode(json)
        shardFunctionHandler(key, value)
    end
end)

local function SendRequest(json)
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then return end
    end, "POST", json)
end

local function HandleServerResponse(array)
    for _, entry in ipairs(array) do
        if entry.key then
            if entry.key == "message" then
                GLOBAL.ExecuteOnAllShards("clientmessage", entry.value)
            elseif entry.key == "playercontroller" then
                GLOBAL.ExecuteOnAllShards("playercontroller", entry.value)
            elseif entry.key == "kick" then
                GLOBAL.ExecuteConsoleCommand("TheNet:Kick(\"" .. entry.value.userid .. "\")")
            elseif entry.key == "ban" then
                GLOBAL.ExecuteConsoleCommand("TheNet:BanForTime(\"" .. entry.value.userid .. "\", " .. entry.value.duration .. ")")
            elseif entry.key == "unban" then
                local blacklist = GLOBAL.TheNet:GetBlacklist()
                local new_blacklist = {}
                for k, baninfo in pairs(blacklist) do
                    if baninfo.userid ~= entry.value.userid then
                        table.insert(new_blacklist, baninfo)
                    end
                end
                GLOBAL.TheNet:SetBlacklist(new_blacklist)
            elseif entry.key == "userlist" then
                local users = GetUsers()
                local jsonEncoded = GLOBAL.json.encode({ key = "userlist", value = { users = users, interaction = entry.value.interaction } })
                SendRequest(jsonEncoded)
            elseif entry.key == "regenerate" then
                GLOBAL.ExecuteConsoleCommand("c_regenerateworld()")
            elseif entry.key == "rollback" then
                GLOBAL.ExecuteConsoleCommand(string.format("c_rollback(%d)", entry.value.quantity))
            elseif entry.key == "terminal" then
                GLOBAL.ExecuteOnAllShards("terminal", entry.value)
            elseif entry.key == "ping" then
                GLOBAL.TheNet:Announce(entry.value.message, nil, nil)
            elseif entry.key == "kill" then
                GLOBAL.ExecuteOnAllShards("kill")
            end
        end
    end
end

local function SendUpdateRequest()
    local jsonClient = GLOBAL.json.encode({ key = "update" })
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then return end
        local jsonServer = GLOBAL.json.decode(result)
        HandleServerResponse(jsonServer)
    end, "POST", jsonClient)
end

local function UpdateLoop(inst)
    SendUpdateRequest()
    inst:DoStaticTaskInTime(.5, UpdateLoop)
end

AddPrefabPostInit("world", function(inst)
    if inst:HasTag("cave") then return end
    inst:DoTaskInTime(0, UpdateLoop)
end)

print("[Bernie] Willow-Response-Module loaded!")
