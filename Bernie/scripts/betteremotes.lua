print("[Bernie] Better-Emotes-Module is loading...")

local GLOBAL = GLOBAL or _G
local emotecooldown = GLOBAL.GetTime()

local anims = { emote_yawn = true, emoteXL_waving1 = true, emoteXL_kiss = true, emoteXL_rude1 = true, emoteXL_dance1 = true }

local function OnPlayerEmote(inst, data)
    if GLOBAL.GetTime() - emotecooldown < 5 then return end
    if not (data and data.anim and (anims[data.anim] or anims[data.anim[1]])) then return end
    local x, y, z = inst.Transform:GetWorldPosition()
    local players = GLOBAL.AllPlayers
    for _, player in ipairs(players) do
        if math.random(0, 2) == 0 then
            if (player ~= inst and not player.components.health:IsDead()) then
                local distance = inst:GetDistanceSqToInst(player)
                if distance <= 64 then
                    if player.Physics and player.Physics:GetMotorSpeed() <= .3 then
                        player:DoTaskInTime(math.random(0.8, 2.8), function()
                            player:PushEvent("emote", { anim = data.anim })
                        end)
                    end
                end
            end
        end
    end
    emotecooldown = GLOBAL.GetTime()
end

AddSimPostInit(function() AddPlayerPostInit(function(inst) inst:ListenForEvent("emote", OnPlayerEmote) end) end)

print("[Bernie] Better-Emotes-Module loaded!")
