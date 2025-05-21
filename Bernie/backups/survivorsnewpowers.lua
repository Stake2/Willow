print("[Bernie] Survivors-New-Powers-Module was loaded!")

local GLOBAL = GLOBAL or _G

AddPrefabPostInit("wilson", function(inst)
    inst:DoTaskInTime(0, function()
        if inst.components.builder then
            inst.components.builder.science_bonus = 1
            inst.components.builder.seafaring_bonus = 1
            local old_DoBuild = inst.components.builder.DoBuild
            inst.components.builder.DoBuild = function(self, recname, ...)
                local result = old_DoBuild(self, recname, ...)
                if self.inst and self.inst.components.sanity then
                    self.inst.components.sanity:DoDelta(1)
                end
                return result
            end
        end
        if inst.components.reader == nil then inst:AddComponent("reader") end
        inst:PushEvent("unlockrecipe")
        inst:ListenForEvent("respawnfromghost", function(inst, data)
            if data and data.source == "resurrectionstatue" then
                if inst.components.health then
                    inst.components.health.penalty = math.max(0,
                        inst.components.health.penalty - 0.25)
                end
            end
        end)
        local old_Read = inst.components.reader.Read
        inst.components.reader.Read = function(self, book, ...)
            if self.inst and self.inst.components.talker then
                local quotes = { "Ah-ha! Magically Science!", "Fascinating...", "Behold the... Science?",
                    "Excuse me, Wickerbottom.", "There must be explanations..." }
                local quote = quotes[math.random(#quotes)]
                self.inst.components.talker:Say(quote, 3)
            end
            return old_Read(self, book, ...)
        end
    end)
end)
