print("[Bernie] Items-Rebalance-Module is loading...")

local GLOBAL = GLOBAL or _G

local function ReworkCookieCutterHat(inst)
    inst:DoTaskInTime(0, function()
        if inst.components.armor then inst.components.armor:SetAbsorption(0.85) end
    end)
end

local function ReworkArmorDragonfly(inst)
    inst:DoTaskInTime(0, function()
        if inst.components.armor then inst.components.armor:SetAbsorption(0.9) end
    end)
end

local function ReworkFlowerHat(inst)
    inst:DoTaskInTime(0, function()
        if not inst.components.equippable then return end
        inst.components.equippable.walkspeedmult = 1.05
        if not inst.components.insulator then inst:AddComponent("insulator") end
        inst.components.insulator:SetSummer()
        inst.components.insulator:SetInsulation(20)
    end)
end

local function ReworkArmorGrass(inst)
    inst:DoTaskInTime(0, function()
        if not inst.components.equippable then return end
        inst.components.equippable.walkspeedmult = 1.05
        if not inst.components.insulator then inst:AddComponent("insulator") end
        inst.components.insulator:SetSummer()
        inst.components.insulator:SetInsulation(40)
    end)
end

local function ReworkPrototyper(inst)
    local oldSetRadius = inst.SetRadius
    function inst:SetRadius(radius)
        oldSetRadius(inst, radius * 1.5)
    end
end

local function ReworkMinifan(inst, data)
    inst:DoTaskInTime(0, function()
        if not inst.components.equippable then return end
        inst.components.equippable.walkspeedmult = 1.05
        if not inst.components.finiteuses then return end
        local max_uses = inst.components.finiteuses:GetMaxUses() * 2
        inst.components.finiteuses:SetMaxUses(max_uses)
        inst.components.finiteuses:SetUses(max_uses)
    end)
end

local function ReworkArmorWagpunk(inst, data)
    inst:DoTaskInTime(0, function()
        if not inst.components.equippable then return end
        if not inst.components.planardefense then inst:AddComponent("planardefense") end
        inst.components.planardefense.defense = 15
        if not inst.components.finiteuses then return end
        local max_uses = inst.components.finiteuses:GetMaxUses() * 1.5
        inst.components.finiteuses:SetMaxUses(max_uses)
        inst.components.finiteuses:SetUses(max_uses)
    end)
end

local function ReworkSlurtleHat(inst, data)
    inst:DoTaskInTime(0, function()
        if not inst.components.armor then return end
        inst.components.armor.maxcondition = inst.components.armor.maxcondition * 2
        inst.components.armor.condition = inst.components.armor.maxcondition
    end)
end

local function ReworkDiviningRod(inst, data)
    inst:DoTaskInTime(0, function()
        if not inst.components.equippable then return end
        inst.components.equippable.walkspeedmult = 1.1
        if inst.components.weapon == nil then inst:AddComponent("weapon") end
        inst.components.weapon:SetDamage(21)
    end)
end

local function ReworkNightlight(inst)
    inst:DoTaskInTime(0, function()
        if inst.Light then
            local radius = inst.Light:GetRadius()
            inst.Light:SetRadius(radius * 3)
        end
        if inst.components.sanityaura then
            local old_CalcSanityAura = inst.components.sanityaura.CalcSanityAura
            inst.components.sanityaura.CalcSanityAura = function(inst, observer)
                local value = 0
                if old_CalcSanityAura then
                    value = old_CalcSanityAura(inst, observer)
                end
                return value / 2
            end
        end
    end)
end

local function ReworkPoop(inst, data)
    inst:DoTaskInTime(0, function()
        inst:AddTag("icebox_valid")
    end)
end

local function ReworkBushHat(inst)
    inst:DoTaskInTime(0, function()
        if inst.components.armor == nil then inst:AddComponent("armor") end
        inst.components.armor:InitCondition(160, 0.2)
        inst.components.armor.indestructible = true
    end)
end

AddPrefabPostInit("cookiecutterhat", ReworkCookieCutterHat)
AddPrefabPostInit("armordragonfly", ReworkArmorDragonfly)
AddPrefabPostInit("flowerhat", ReworkFlowerHat)
AddPrefabPostInit("armorgrass", ReworkArmorGrass)
AddPrefabPostInit("minifan", ReworkMinifan)
AddPrefabPostInit("armorwagpunk", ReworkArmorWagpunk)
AddPrefabPostInit("slurtlehat", ReworkSlurtleHat)
AddPrefabPostInit("diviningrod", ReworkDiviningRod)
AddPrefabPostInit("nightlight", ReworkNightlight)
AddPrefabPostInit("bushhat", ReworkBushHat)

AddComponentPostInit("prototyper", ReworkPrototyper)

AddPrefabPostInit("poop", ReworkPoop)
AddPrefabPostInit("guano", ReworkPoop)

print("[Bernie] Items-Rebalance-Module loaded!")
