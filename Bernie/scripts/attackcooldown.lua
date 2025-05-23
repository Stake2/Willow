print("[Bernie] Attack-Cooldown-Module is loading...")

local GLOBAL = GLOBAL or _G

local attackcooldown = 0.460
local attackcooldowns = {}
local gracecooldowns = {}

local blacklist = {slingshot_claire = true, slingshot_jessie = true, slingshot_matilda = true, slingshot_gnasher = true, magnerang = true, spear_wathgrithr_lightning_charged = true, staff_lunarplant = true, voidcloth_boomerang = true, boomerang = true, blowdart_pipe = true, blowdart_fire = true, blowdart_sleep = true, icestaff = true, firestaff = true }
local attackblacklist = { willow_shadow_flame = true, flamethrower_fx = true }

local function starts_with(str, prefix)
    return string.sub(str, 1, #prefix) == prefix
end

local function OnPlayerHitOther(inst, data)
    if not inst and not data then return end
    local guid = inst.GUID and GLOBAL.tostring(inst.GUID)
    local spotted = false
    if not attackcooldowns[guid] then attackcooldowns[guid] = 0 end
    if not gracecooldowns[guid] then gracecooldowns[guid] = 0 end
    if inst:HasTag("weremoose") or inst:HasTag("weregoose") or inst:HasTag("werebeaver") then return end
    if data.damage then if data.damage < 34 then return end end
    if data.weapon then
        if (attackblacklist[data.weapon.prefab]) then return end
        if starts_with(data.weapon.prefab, "dumbell") then return end
        print("weapon: " .. tostring(data.weapon))
        if data.weapon.prefab then print("weapon prefab: " .. tostring(data.weapon.prefab)) end
    end
    if data.stimuli then
        print("stimuli: " .. tostring(data.stimuli))
        if data.stimuli == "electric" then
            if inst.components.upgrademoduleowner then for _, module in pairs(inst.components.upgrademoduleowner.modules) do if module.prefab == "wx_electric_circuit" then return end end end
            if data.weapon and data.weapon.prefab == "spear_wathgrithr_lightning" then return end
        end
        if data.stimuli == "soul" then return end
    end
    local currenttime = GLOBAL.GetTime()
    if currenttime < (attackcooldowns[guid] or 0) then spotted = true end
    local cooldownValue = attackcooldown
    if inst.components.inventory then
        local handItem = inst.components.inventory:GetEquippedItem(GLOBAL.EQUIPSLOTS.HANDS)
        if handItem then
            if blacklist[handItem.prefab] then
                cooldownValue = -1
            end
            if starts_with(handItem.prefab, "slingshot") then return end
            if handItem.prefab == "alarmingclock" then cooldownValue = cooldownValue * 1.15 end
            if inst.components.rider and inst.components.rider:IsRiding() then cooldownValue = cooldownValue * 1.06 end
        end
    end
    if (cooldownValue == -1) then return end
    attackcooldowns[guid] = currenttime + cooldownValue
    if spotted == true then
        gracecooldowns[guid] = gracecooldowns[guid] + 1
    else
        if gracecooldowns[guid] > 0 then gracecooldowns[guid] = gracecooldowns[guid] - 1 end
    end
end

local function OnPlayerSpawn(inst)
    local guid = inst.GUID and GLOBAL.tostring(inst.GUID)
    if not attackcooldowns[guid] then attackcooldowns[guid] = 0 end
    if not gracecooldowns[guid] then gracecooldowns[guid] = 0 end
    if not inst.components.combat then return end
    if not inst._originalCanAttack then inst._originalCanAttack = inst.components.combat.CanAttack end
    inst.components.combat.CanAttack = function(self, target)
        local currenttime = GLOBAL.GetTime()
        if currenttime < attackcooldowns[guid] then return false end
        if inst.components.locomotor and inst.components.locomotor:IsMoving() then return false end
        return inst._originalCanAttack(self, target)
    end
    local old_DoAttack = inst.components.combat.DoAttack
    inst.components.combat.DoAttack = function(self, target, ...)
        local currenttime = GLOBAL.GetTime()
        if not (currenttime < (attackcooldowns[guid] or 0)) then return old_DoAttack(self, target, ...) end
        if gracecooldowns[guid] <= 1 then return old_DoAttack(self, target, ...) end
        if inst.components.talker then inst.components.talker:Say("...") end
        if inst.SoundEmitter then inst.SoundEmitter:PlaySound("dontstarve/HUD/click_negative", "error_sound") end
        if inst.components.sanity then inst.components.sanity:DoDelta(-30) end
        if inst.components.freezable then
            inst.components.freezable:AddColdness(10)
            inst.components.freezable:SpawnShatterFX()
        end
        attackcooldowns[guid] = currenttime + (attackcooldown * 2)
        return nil
    end
end

AddSimPostInit(function()
    AddPlayerPostInit(function(inst)
        inst:ListenForEvent("onhitother", OnPlayerHitOther)
        OnPlayerSpawn(inst)
    end)
end)

print("[Bernie] Attack-Cooldown-Module loaded!")
