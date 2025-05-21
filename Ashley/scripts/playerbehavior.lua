print("[Ashley] Player-Behavior-Module is loading...")

local GLOBAL = GLOBAL or _G
local combatreplica = GLOBAL.require "components/combat_replica"

local oldIsAlly = combatreplica.IsAlly
function combatreplica:IsAlly(guy, ...)
    if guy:HasTag("wall") then return true end
    return oldIsAlly(self, guy, ...)
end

print("[Ashley] Player-Behavior-Module loaded!")
