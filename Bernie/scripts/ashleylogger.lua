print("[Bernie] Ashley-Logger-Module is loading...")

local GLOBAL = GLOBAL or _G

local serverUrl = "http://localhost:8090/dst"

local function GetUsers()
    if not (GLOBAL.TheWorld) then return end
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

local function GetUserById(userid)
    if not userid then return nil end
    local users = GetUsers()
    if not users then return nil end
    return users[userid] or nil
end

local function SendRequest(json)
    GLOBAL.TheSim:QueryServer(serverUrl, function(result, isSuccessful, resultCode)
        if not (isSuccessful and resultCode == 200 and result) then return end
    end, "POST", json)
end

local function OnCheatRPC(player, json)
    if not (GLOBAL.TheWorld) then return end
    local value = type(json) == "table" and json or GLOBAL.json.decode(json)
    if not value then return end
    local user = GetUserById(value.userid)
    if not user then return end
    local jsonEncoded = GLOBAL.json.encode({ key = value.code, value = { prefab = user.prefab, name = user.name, userid = user.userid, quantity = value.quantity } })
    SendRequest(jsonEncoded)
end

local function OnSimpleRPC(player, json, key)
    if not (GLOBAL.TheWorld) then return end
    local value = type(json) == "table" and json or GLOBAL.json.decode(json) or nil
    if not value then return end
    local user = GetUserById(player.userid)
    if not user then return end
    local payload = {}
    if type(value) == "table" then
        for k, v in pairs(value) do
            payload[k] = v
        end
    else
        payload = value
    end
    payload.userid = user.userid
    payload.name = user.name
    local jsonEncoded = GLOBAL.json.encode({ key = key, value = payload })
    SendRequest(jsonEncoded)
end

local function OnHashRPC(player, json)
    OnSimpleRPC(player, json, "ashleyhash")
end

AddModRPCHandler("ashleyservernightvision", "message", OnCheatRPC)
AddModRPCHandler("ashleyserverlongvision", "message", OnCheatRPC)
AddModRPCHandler("ashleyserverfovvision", "message", OnCheatRPC)
AddModRPCHandler("ashleyserverdistantvision", "message", OnCheatRPC)

AddModRPCHandler("ashleyserverhash", "message", OnHashRPC)

AddModRPCHandler("ashleyservermodlist", "message", function(player, json)
    OnSimpleRPC(player, json, "modlist")
end)

print("[Bernie] Ashley-Logger-Module loaded!")
