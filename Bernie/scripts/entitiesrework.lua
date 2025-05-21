print("[Bernie] Entities-Rework-Module is loading...")

local GLOBAL = GLOBAL or _G

local custompignames = { "Melus Grax", "Adrenus Linus", "Jonus Femboius", "Whitius Foxus", "Easter Eggius", "Bolsonarius", "Al'Facio", "Vampirum Red-Pig", "Nicky Porkeo", "Quiassambius Boar", "Sopius Penicus", "Lala Chinus", "Dixis Talus", "Bungarius", "Fazus Elius" }
local critters = { "kitten", "warg_pup", "lamb", "crab", "glomling", "pigeon", "moth", "smallbird" }
local chairlist = { "evergreen_stump", "deciduoustree_stump", "marsh_tree_stump", "twiggytree_stump", "lumpy_stump", }

local function ReduceHungerRate(inst)
    if inst and inst.components.hunger then inst.components.hunger:SetRate(inst.components.hunger.hungerrate * 0.1) end
end

local function DragonflyController(inst)
    inst:DoTaskInTime(0, function()
        local _OldTakeDamage = inst.components.combat.GetAttacked
        inst.components.combat.GetAttacked = function(self, attacker, damage, ...)
            if inst.enraged then damage = damage * 0.64 end
            return _OldTakeDamage(self, attacker, damage, ...)
        end
        local _OldCalcDamage = inst.components.combat.CalcDamage
        inst.components.combat.CalcDamage = function(self, target, weapon, multiplier, ...)
            local dmg = _OldCalcDamage(self, target, weapon, multiplier, ...)
            if inst.enraged and target and not target:HasTag("player") then dmg = dmg * 3 end
            return dmg
        end
        local _OldDoAttack = inst.components.combat.DoAttack
        inst.components.combat.DoAttack = function(self, target, weapon, projectile, stimuli, ...)
            local result = _OldDoAttack(self, target, weapon, projectile, stimuli, ...)
            if inst.enraged and target and target.components.rideable then
                local rider = target.components.rideable:GetRider()
                if rider and rider.components.health and not rider.components.health:IsDead() then
                    local dmg = self:CalcDamage(rider, weapon, nil)
                    rider.components.combat:GetAttacked(inst, dmg, nil, weapon, stimuli)
                end
            end
            return result
        end
    end)
end

local function KlausController(inst)
    inst:DoTaskInTime(0, function()
        local _OldCalcDamage = inst.components.combat.CalcDamage
        inst.components.combat.CalcDamage = function(self, target, weapon, multiplier, ...)
            local dmg = _OldCalcDamage(self, target, weapon, multiplier, ...)
            if inst.enraged and target and not target:HasTag("player") then dmg = dmg * 3 end
            return dmg
        end
        local _OldDoAttack = inst.components.combat.DoAttack
        inst.components.combat.DoAttack = function(self, target, weapon, projectile, stimuli, ...)
            local result = _OldDoAttack(self, target, weapon, projectile, stimuli, ...)
            if inst.enraged and target and target.components.rideable then
                local rider = target.components.rideable:GetRider()
                if rider and rider.components.health and not rider.components.health:IsDead() then
                    local dmg = self:CalcDamage(rider, weapon, nil)
                    rider.components.combat:GetAttacked(inst, dmg, nil, weapon, stimuli)
                end
            end
            return result
        end
    end)
end

local function PigmanController(inst)
    inst:DoTaskInTime(0, function()
        if not inst or inst:HasTag("customname") or not inst.components.named then return end
        if not (inst and inst.components.named) then return end
        local dice = math.random(0, 9)
        if dice <= 2 then inst.components.named:SetName(custompignames[math.random(#custompignames)]) end
        inst:AddTag("customname")
    end)
end

local function BeefaloController(inst, data)
    inst:DoTaskInTime(0, function()
        inst:ListenForEvent("obediencedelta", function(inst)
            local tamed = inst.components.domesticatable:IsDomesticated() or
                inst.components.domesticatable:GetDomestication() > 0
            local poop_spawner = inst.components.periodicspawner
            if tamed and poop_spawner then poop_spawner:Stop() end
        end)
        inst:ListenForEvent("goneferal", function(inst)
            local poop_spawner = inst.components.periodicspawner
            if poop_spawner then poop_spawner:Start() end
        end)
    end)
end

local chairlist = {
    "evergreen_stump",
    "deciduoustree_stump",
    "marsh_tree_stump",
    "twiggytree_stump",
    "lumpy_stump",
}

local function AddSitComponentToChair(prefabname)
    AddPrefabPostInit(prefabname, function(inst)
        if not GLOBAL.TheWorld.ismastersim then return end
        if inst.components.sittable == nil then
            inst:AddComponent("sittable")
        end
        inst:AddTag("cansit")
    end)
end

for _, prefab in ipairs(chairlist) do
    AddSitComponentToChair(prefab)
end

AddStategraphPostInit("wilson", function(sg)
    sg.states["sit_on_stump"] = GLOBAL.State {
        name = "sit_on_stump",
        tags = { "idle", "notalking", "nodangle" },
        onenter = function(inst)
            inst.components.locomotor:Stop()
            inst.AnimState:PlayAnimation("emote_sit_loop", true)
            if inst.SoundEmitter then
                local voice = inst.talksound or ("dontstarve/characters/" .. (inst.prefab or "wilson") .. "/talk")
                inst.SoundEmitter:PlaySound(voice)
            end
        end,
    }
end)

AddStategraphActionHandler("wilson", GLOBAL.ActionHandler(GLOBAL.ACTIONS.SITON, "sit_on_stump"))

AddPrefabPostInit("dragonfly", DragonflyController)
AddPrefabPostInit("klaus", KlausController)
AddPrefabPostInit("pigman", PigmanController)
AddPrefabPostInit("beefalo", BeefaloController)
for _, prefab in ipairs(critters) do
    AddPrefabPostInit(prefab, ReduceHungerRate)
end

print("[Bernie] Entities-Rework-Module loaded!")
