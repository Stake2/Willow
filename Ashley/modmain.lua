print("[Ashley] Hello world!")

local GLOBAL = GLOBAL or _G
local SERVER_SIDE = GLOBAL.TheNet:GetIsServer()
local CLIENT_SIDE = GLOBAL.TheNet:GetIsClient() or (SERVER_SIDE and not GLOBAL.TheNet:IsDedicated())

print('[Ashley] Loading Both-Side Modules')

Assets = {
    Asset("IMAGE", "images/profileflair_ashley.tex"),
    Asset("ATLAS", "images/profileflair_ashley.xml"),
    Asset("IMAGE", "images/profileflair_bernie.tex"),
    Asset("ATLAS", "images/profileflair_bernie.xml"),
    Asset("IMAGE", "images/profileflair_willow.tex"),
    Asset("ATLAS", "images/profileflair_willow.xml"),
    Asset("IMAGE", "images/profileflair_global.tex"),
    Asset("ATLAS", "images/profileflair_global.xml"),
    Asset("IMAGE", "images/profileflair_private.tex"),
    Asset("ATLAS", "images/profileflair_private.xml"),
    Asset("IMAGE", "images/profileflair_discord.tex"),
    Asset("ATLAS", "images/profileflair_discord.xml"),
    Asset("IMAGE", "images/profileflair_staffdiscord.tex"),
    Asset("ATLAS", "images/profileflair_staffdiscord.xml"),
    Asset("IMAGE", "images/profileflair_server.tex"),
    Asset("ATLAS", "images/profileflair_server.xml")
}

if CLIENT_SIDE then
    print('[Ashley] Loading Client-Side Modules')
    modimport("scripts/chat.lua")
    modimport("scripts/commands.lua")
    modimport("scripts/camera.lua")
    modimport("scripts/playerbehavior.lua")
    modimport("scripts/anticheat.lua")
end

if SERVER_SIDE then
    print('[Ashley] Loading Server-Side Modules')
end

print('[Ashley] Finished loading!')
