print("[Ashley] Camera-Module is loading...")

local GLOBAL = GLOBAL or _G

GLOBAL.cammaxdistpitch = 60
GLOBAL.lastdistance = 30

local function BindKey(key, func)
    if type(key) == "string" then
        GLOBAL.TheInput:AddKeyUpHandler(key:lower():byte(), func)
    elseif key > 0 then
        GLOBAL.TheInput:AddKeyUpHandler(key, func)
    end
end

local function AddPitch(value)
    if GLOBAL.TheCamera then
        local camera = GLOBAL.TheCamera
        if value > 0 then
            camera.maxdistpitch = math.min(camera.maxdistpitch + value, 60)
        else
            camera.maxdistpitch = math.max(camera.maxdistpitch + value, 40)
        end
        GLOBAL.cammaxdistpitch = camera.maxdistpitch
        if GLOBAL.ThePlayer.components.talker then
            GLOBAL.ThePlayer.components.talker:Say("Pitch em " .. camera.maxdistpitch .. " (Padrão 60)")
        end
    end
end

BindKey(290, function() AddPitch(-5) end)
BindKey(291, function() AddPitch(5) end)

AddClassPostConstruct("screens/playerhud", function(self) self.UpdateClouds = function() end end)
AddComponentPostInit("focalpoint", function(self, inst) self.StartFocusSource = function() end end)

AddClassPostConstruct("cameras/followcamera", function(self)
    local FollowCameraSetDefault = self.SetDefault
    self.SetDefault = function(self)
        FollowCameraSetDefault(self)
        self.targetpos = GLOBAL.Vector3(0, 0, 0)
        self:SetDefaultOffset()
        if self.headingtarget == nil then
            self.headingtarget = 45
        end
        self.fov = 35
        self.pangain = 4
        self.headinggain = 20
        self.distancegain = 1
        self.zoomstep = 8
        self.mindist = 10
        self.maxdist = 43
        self.distancetarget = GLOBAL.lastdistance
        self.mindistpitch = 30
        self.maxdistpitch = GLOBAL.cammaxdistpitch
        self.shake = nil
        if self.gamemode_defaultfn then
            self.gamemode_defaultfn(self)
        end
        if self.target ~= nil then
            self:SetTarget(self.target)
        end
    end

    self.ZoomIn = function(self, step)
        self.distancetarget = math.max(self.mindist, self.distancetarget - (step or self.zoomstep))
        GLOBAL.lastdistance = self.distancetarget
    end

    self.ZoomOut = function(self, step)
        self.distancetarget = math.min(self.maxdist, self.distancetarget + (step or self.zoomstep))
        GLOBAL.lastdistance = self.distancetarget
    end
end)

AddGlobalClassPostConstruct("camerashake", "CameraShake", function(self)
    local oldStartShake = self.StartShake
    function self:StartShake(type, duration, speed, scale, ...)
        return oldStartShake(self, type, duration, speed, (scale or 1) * 0.25, ...)
    end
end)

print("[Ashley] Camera-Module loaded!")
