print("[Ashley] Chat-Module is loading...")

local GLOBAL = GLOBAL or _G

local profiles = {
    ashley = {
        colour = { 0.173, 0.463, 0.604, 1 },
        flair = "profileflair_ashley",
    },
    bernie = {
        colour = { 0.502, 0.349, 0.235, 1 },
        flair = "profileflair_bernie",
    },
    willow = {
        colour = { 0.612, 0.188, 0.212, 1 },
        flair = "profileflair_willow",
    },
    global = {
        colour = { 0.278, 0.651, 0.451, 1 },
        flair = "profileflair_global",
    },
    private = {
        colour = { 0.447, 0.463, 0.529, 1 },
        flair = "profileflair_private",
    },
    discord = {
        colour = { 0.549, 0.596, 0.855, 1 },
        flair = "profileflair_discord",
    },
    staffdiscord = {
        colour = { 0.8706, 0.5725, 0.3843, 1 },
        flair = "profileflair_staffdiscord",
    },
    server = {
        colour = { 0.298, 0.251, 0.263, 1 },
        flair = "profileflair_server",
    }
}

local old_GetProfileFlairAtlasAndTex = GLOBAL.GetProfileFlairAtlasAndTex

GLOBAL.GetProfileFlairAtlasAndTex = function(item_key)
    if item_key == "profileflair_ashley" then
        return "images/profileflair_ashley.xml", "profileflair_ashley", "profileflair_none"
    elseif item_key == "profileflair_bernie" then
        return "images/profileflair_bernie.xml", "profileflair_bernie", "profileflair_none"
    elseif item_key == "profileflair_willow" then
        return "images/profileflair_willow.xml", "profileflair_willow", "profileflair_none"
    elseif item_key == "profileflair_global" then
        return "images/profileflair_global.xml", "profileflair_global", "profileflair_none"
    elseif item_key == "profileflair_private" then
        return "images/profileflair_private.xml", "profileflair_private", "profileflair_none"
    elseif item_key == "profileflair_discord" then
        return "images/profileflair_discord.xml", "profileflair_discord", "profileflair_none"
    elseif item_key == "profileflair_staffdiscord" then
        return "images/profileflair_staffdiscord.xml", "profileflair_staffdiscord", "profileflair_none"
    elseif item_key == "profileflair_server" then
        return "images/profileflair_server.xml", "profileflair_server", "profileflair_none"
    end
    return old_GetProfileFlairAtlasAndTex(item_key)
end

GLOBAL.ShowCustomMessage = function(value)
    local profile = profiles[value.type]
    if not profile then return end
    GLOBAL.ChatHistory:AddToHistory(
        GLOBAL.ChatTypes.Message,
        nil,
        nil,
        value.name,
        value.message,
        profile.colour,
        profile.flair,
        false,
        false,
        TEXT_FILTER_CTX_CHAT
    )
end

function ClientMessageHandler(json)
    if not (GLOBAL.TheWorld) then return end
    local data = type(json) == "table" and json or GLOBAL.json.decode(json) or nil
    if not data then return end
    if not data.name or not data.type or not data.message then return end
    GLOBAL.ShowCustomMessage({ name = data.name, type = data.type, message = data.message })
end

AddClientModRPCHandler("ashleyclientmessage", "message", ClientMessageHandler)

print("[Ashley] Announcements-Module loaded successfully!")
