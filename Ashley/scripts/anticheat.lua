print('[Ashley] Ashley was loaded!')

local GLOBAL = GLOBAL or _G

local hashcode = nil

local function DummyRPCHandler(inst, data) print("[Ashley] Sending RPC: " .. data) end
AddModRPCHandler("ashleyservernightvision", "message", DummyRPCHandler)
AddModRPCHandler("ashleyserverlongvision", "message", DummyRPCHandler)
AddModRPCHandler("ashleyserverfovvision", "message", DummyRPCHandler)
AddModRPCHandler("ashleyserverdistantvision", "message", DummyRPCHandler)
AddModRPCHandler("ashleyserverhash", "message", DummyRPCHandler)
AddModRPCHandler("ashleyservermodlist", "message", DummyRPCHandler)

local function CheckPlayer(inst)
    local state = { distancegrace = true, nvprotection = false, nvenabled = false }
    inst:ListenForEvent("nightvision", function(_inst, enabled)
        if enabled then state.nvenabled = true end
    end)
    inst:DoPeriodicTask(1, function()
        local longvisionhelmets = { scrap_monoclehat = true }
        local nightvisionhelmets = { molehat = true, ghostflowerhat = true }
        if GLOBAL.TheCamera then
            local camera = GLOBAL.TheCamera
            local headitem = nil
            if inst.replica.inventory then
                headitem = inst.replica.inventory:GetEquippedItem(GLOBAL.EQUIPSLOTS.HEAD)
                if headitem then
                    headitem = headitem.prefab
                end
            end
            if inst.components.playervision then
                local check = true
                if inst.components.playervision.forcenightvision or state.nvenabled == true or inst.components.playervision:HasNightVision() then
                    if (nightvisionhelmets[headitem]) then
                        state.nvprotection = true
                        check = false
                    end
                    if inst.prefab == "wx78" and inst.replica.inst.GetModulesData then
                        local modules = inst.replica.inst:GetModulesData()
                        if modules then
                            for _, v in pairs(modules) do
                                if v == 7 then
                                    state.nvprotection = true
                                    check = false
                                end
                            end
                        end
                    end
                    if inst.replica and inst.replica.inst and inst.replica.inst.weremode then
                        local weremode = inst.replica.inst.weremode:value()
                        if weremode >= 1 and weremode <= 3 then
                            state.nvprotection = true
                            check = false
                        end
                    end
                    if check == true then
                        if state.nvprotection == false then
                            inst.components.playervision.forcenightvision = false
                            inst:PushEvent("nightvision", false)
                            state.nvenabled = false
                            local json = GLOBAL.json.encode({ userid = inst.userid, code = "nightvision" })
                            GLOBAL.ShowCustomMessage({
                                name = "Ashley",
                                type = "ashley",
                                message =
                                "Cuidado! Evite trapaças como Visão-Noturna!"
                            })
                            SendModRPCToServer(GetModRPC("ashleyservernightvision", "message"), json)
                        else
                            inst.components.playervision.forcenightvision = false
                            inst:PushEvent("nightvision", false)
                            state.nvenabled = false
                            state.nvprotection = false
                        end
                    end
                end
            end
            if camera.mindistpitch ~= 30 then
                camera.mindistpitch = 30
            end
            if camera.maxdistpitch > 60 then
                camera.maxdistpitch = 60
            end
            if camera.maxdist > 43 then
                if state.distancegrace == false then
                    if longvisionhelmets[headitem] then
                        if camera.maxdist > 63 then
                            local json = GLOBAL.json.encode({
                                userid = inst.userid,
                                code = "longvision",
                                quantity = camera.maxdist
                            })
                            GLOBAL.ShowCustomMessage({
                                name = "Ashley",
                                type = "ashley",
                                message =
                                "Cuidado! Evite trapaças como Super-Zoom!"
                            })
                            camera.maxdist = 63
                            state.distancegrace = true
                            SendModRPCToServer(GetModRPC("ashleyserverlongvision", "message"), json)
                        end
                    else
                        local json = GLOBAL.json.encode({
                            userid = inst.userid,
                            code = "longvision",
                            quantity = camera.maxdist
                        })
                        GLOBAL.ShowCustomMessage({
                            name = "Ashley",
                            type = "ashley",
                            message =
                            "Cuidado! Evite trapaças como Super-Zoom!"
                        })
                        camera.maxdist = 43
                        state.distancegrace = true
                        SendModRPCToServer(GetModRPC("ashleyserverlongvision", "message"), json)
                    end
                else
                    state.distancegrace = false
                end
            end
            if (camera.fov > 35) then
                local json = GLOBAL.json.encode({ userid = inst.userid, code = "fovvision", quantity = camera.fov })
                GLOBAL.ShowCustomMessage({
                    name = "Ashley",
                    type = "ashley",
                    message =
                    "Cuidado! Evite trapaças como FOV-Aumentado!"
                })
                camera.fov = 35
                SendModRPCToServer(GetModRPC("ashleyserverfovvision", "message"), json)
            end
            local player = GLOBAL.ThePlayer
            local target_pos
            if GLOBAL.TheCamera.target then
                target_pos = GLOBAL.TheCamera.target:GetPosition()
            elseif GLOBAL.TheCamera and GLOBAL.TheCamera.targetpos then
                target_pos = GLOBAL.Vector3(GLOBAL.TheCamera.targetpos.x, GLOBAL.TheCamera.targetpos.y,
                    GLOBAL.TheCamera.targetpos.z)
            end
            local player_pos = player:GetPosition()
            local distance = target_pos:Dist(player_pos)
            if distance > 20 then
                local json = GLOBAL.json.encode({ userid = inst.userid, code = "distantvision", quantity = distance })
                GLOBAL.ShowCustomMessage({
                    name = "Ashley",
                    type = "ashley",
                    message =
                    "Cuidado! Evite trapaças como Movimentar a Câmera!"
                })
                GLOBAL.TheCamera:SetTarget(GLOBAL.ThePlayer)
                SendModRPCToServer(GetModRPC("ashleyserverdistantvision", "message"), json)
            end
        end
    end)
end

local function SimpleHash(input)
    if type(input) ~= "string" then
        input = tostring(input) or "NIL"
    end
    local servername = GLOBAL.TheNet:GetServerName() or "unknown"
    local serverclan = GLOBAL.TheNet.GetServerClanID and GLOBAL.TheNet:GetServerClanID() or "noclan"
    local hostid = (servername .. "-ashley-" .. serverclan):gsub(" ", "")
    local data = input .. "::" .. hostid
    local hash = 0
    for i = 1, #data do
        hash = (hash + string.byte(data, i) * i) % 1000000007
    end
    return tostring(hash)
end

local function GetFunctionHash(func)
    local dumped_code = string.dump(func)
    return SimpleHash(dumped_code)
end

local function GetHash()
    local gethash = GetFunctionHash(GetHash)
    local checkplayer = GetFunctionHash(CheckPlayer)
    local functionshash = GetFunctionHash(GetFunctionHash)
    local simpleshash = GetFunctionHash(SimpleHash)
    local json = GLOBAL.json.encode({
        gethash = tostring(gethash),
        checkplayer = tostring(checkplayer),
        functionshash = tostring(functionshash),
        simpleshash = tostring(simpleshash),
        camerafov = tostring(GLOBAL.TheCamera.fov),
        cameradistance = tostring(GLOBAL.TheCamera.distance),
        cameramaxdist = tostring(GLOBAL.TheCamera.maxdist)
    })
    SendModRPCToServer(GetModRPC("ashleyserverhash", "message"), json)
end

local function SendModListToServer()
    if GLOBAL.TheNet ~= nil then
        if GLOBAL.KnownModIndex ~= nil then
            local mods = GLOBAL.KnownModIndex:GetModsToLoad()
            if mods ~= nil and #mods > 0 then
                local json = GLOBAL.json and GLOBAL.json.encode and GLOBAL.json.encode(mods) or ""
                SendModRPCToServer(GetModRPC("ashleyservermodlist", "message"), json)
            end
        end
    end
end

local function OnPlayerActivated(inst)
    if inst == GLOBAL.ThePlayer then
        SendModListToServer()
    end
end


AddPlayerPostInit(function(inst)
    inst:DoTaskInTime(0, function()
        if (inst == GLOBAL.ThePlayer) then
            inst:DoTaskInTime(0, CheckPlayer)
            inst:DoPeriodicTask(300, GetHash)
            OnPlayerActivated(inst)
        end
    end)
end)
