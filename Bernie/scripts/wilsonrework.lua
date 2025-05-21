print("[Bernie] Wilson-Rework-Module is loading...")

local GLOBAL = GLOBAL or _G

local sanityquotes = { "Another experiment complete.", "Science never sleeps!", "Crafted with intellectual rigor.", "Confirmed hyphotesis.", "It's all coming together..." }
local bookquotes = { "Ah-ha! Magically Science!", "Fascinating...", "Behold the... Science?", "Excuse me, Wickerbottom.", "There must be explanations..." }

local function ReworkWilson(inst)
    if inst.components.builder then
        inst.components.builder.science_bonus = 1
        inst.components.builder.seafaring_bonus = 1
        local old_DoBuild = inst.components.builder.DoBuild
        inst.components.builder.DoBuild = function(self, recname, ...)
            local result = old_DoBuild(self, recname, ...)
            if self.inst and self.inst.components.sanity then
                self.inst.components.sanity:DoDelta(1)
                if math.random() < 0.10 and self.inst.components.talker then
                    local quote = sanityquotes[math.random(#sanityquotes)]
                    self.inst.components.talker:Say(quote, 3)
                end
            end
            return result
        end
    end
    if inst.components.reader == nil then inst:AddComponent("reader") end
    inst:PushEvent("unlockrecipe")
    local old_Read = inst.components.reader.Read
    inst.components.reader.Read = function(self, book, ...)
        if self.inst and self.inst.components.talker then
            local quote = bookquotes[math.random(#bookquotes)]
            self.inst.components.talker:Say(quote, 3)
        end
        if self.inst and self.inst.components.sanity then
            self.inst.components.sanity:DoDelta(-33)
        end
        return old_Read(self, book, ...)
    end
end

AddPrefabPostInit("wilson", function(inst)
    inst:DoTaskInTime(0, function()
        ReworkWilson(inst)
    end)
end)

print("[Bernie] Wilson-Rework-Module loaded!")
