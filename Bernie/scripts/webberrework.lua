print("[Bernie] Webber-Rework-Module is loading...")

local GLOBAL = GLOBAL or _G

AddPrefabPostInit("webber", function(inst)
    inst:DoTaskInTime(0, function()
        if not inst.components.reader then
            inst:AddComponent("reader")
            inst.components.reader:SetAspiringBookworm(true)
            inst:AddTag("reader")
            inst:AddTag("aspiring_bookworm")
        end
    end)
end)

print("[Bernie] Webber-Rework-Module loaded!")
