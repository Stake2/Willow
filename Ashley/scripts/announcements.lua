print("[Ashley] Announcements-Module is loading...")

local GLOBAL = GLOBAL or _G
local Widget = require "widgets/widget"
local Text = require "widgets/text"

local backgrounds = {}

local BuildWidget = {
    announcement = function(text_widget, screen_height, screen_width, type)
        text_widget:SetPosition(screen_width / 2, screen_height / 2 + screen_height * 0.3 + 20)
        backgrounds[type]:SetPosition(screen_width / 2, screen_height / 2 + screen_height * 0.3 + 5)
        backgrounds[type]:SetSize(500, 150)
        backgrounds[type]:SetTint(.9, .9, .9, .9)
        text_widget.text = text_widget:AddChild(Text(GLOBAL.TALKINGFONT, 35))
        text_widget.text:SetPosition(0, 0)
        text_widget.text:SetColour(.8, .7, .1, 1)
        text_widget:SetClickable(false)
        backgrounds[type]:SetClickable(false)
        backgrounds[type]:Hide()
        return text_widget
    end,

    announcementdescription = function(text_widget, screen_height, screen_width, type)
        text_widget:SetPosition(screen_width / 2, screen_height / 2 + screen_height * 0.3 - 20)
        text_widget.text = text_widget:AddChild(Text(GLOBAL.TALKINGFONT, 30))
        text_widget.text:SetPosition(0, 0)
        text_widget:SetClickable(false)
        return text_widget
    end,

    information = function(text_widget, screen_height, screen_width, type)
        text_widget:SetPosition(screen_width / 2 + screen_width * 0.3, screen_height / 2 + 78)
        backgrounds[type]:SetPosition(screen_width / 2 + screen_width * 0.3 - 6, screen_height / 2)
        backgrounds[type]:SetSize(500, 300)
        backgrounds[type]:SetTint(.1, .1, .1, .9)
        text_widget.text = text_widget:AddChild(Text(GLOBAL.TALKINGFONT, 35))
        text_widget.text:SetPosition(0, 0)
        text_widget.text:SetColour(.3, .4, .7, 1)
        text_widget:SetClickable(false)
        backgrounds[type]:SetClickable(false)
        backgrounds[type]:Hide()
        return text_widget
    end,

    informationdescription = function(text_widget, screen_height, screen_width, type)
        text_widget:SetPosition(screen_width / 2 + screen_width * 0.3, screen_height / 2 - 28)
        text_widget.text = text_widget:AddChild(Text(GLOBAL.TALKINGFONT, 30))
        text_widget.text:SetPosition(0, 0)
        text_widget.text:SetHAlign(GLOBAL.ANCHOR_LEFT)
        text_widget:SetClickable(false)
        return text_widget
    end,

    warning = function(text_widget, screen_height, screen_width, type)
        text_widget:SetPosition(screen_width / 2, screen_height / 2)
        backgrounds[type]:SetPosition(screen_width / 2, screen_height / 2)
        backgrounds[type]:SetSize(400, 100)
        backgrounds[type]:SetTint(0, 0, 0, .8)
        text_widget.text = text_widget:AddChild(Text(GLOBAL.TALKINGFONT, 30))
        text_widget.text:SetPosition(0, 0)
        text_widget.text:SetColour(.8, .3, .3, 1)
        text_widget:SetClickable(false)
        backgrounds[type]:SetClickable(false)
        local decoration = backgrounds[type]:AddChild(GLOBAL.Image("images/ui.xml", "single_option_bg_large_white.tex"))
        decoration:SetSize(400, 100)
        decoration:SetClickable(false)
        decoration:SetTint(0, 0, 0, 0.9)
        backgrounds[type]:Hide()
        return text_widget
    end
}

local function CreateTextWidget(owner, type, hasbackground)
    if hasbackground then
        if type == "warning" then
            backgrounds[type] = owner.HUD:AddChild(GLOBAL.Image("images/frontend.xml", "nav_bg_short.tex"))
        elseif type == "information" then
            backgrounds[type] = owner.HUD:AddChild(GLOBAL.Image("images/scoreboard.xml", "scoreboard_frame.tex"))
        else
            backgrounds[type] = owner.HUD:AddChild(GLOBAL.Image("images/plantregistry.xml", "oversizedpictureframe.tex"))
        end
    end
    local text_widget = owner.HUD:AddChild(Widget("CustomTextWidget"))
    local screen_width, screen_height = GLOBAL.TheSim:GetScreenSize()
    return BuildWidget[type](text_widget, screen_height, screen_width, type)
end

local function AddTextWidgetToPlayer(inst, type)
    if inst == GLOBAL.ThePlayer and inst.HUD then
        if inst[type] == nil then
            if type == "announcementdescription" or type == "informationdescription" then
                inst[type] = CreateTextWidget(inst, type, false)
            else
                inst[type] = CreateTextWidget(inst, type, true)
            end
        end
    end
end

GLOBAL.UpdateText = function(text, target, duration)
    print("[UpdateText] Called with text:", text, "target:", target, "duration:", duration)
    if GLOBAL.ThePlayer and GLOBAL.ThePlayer[target] then
        print("[UpdateText] Setting text for target:", target)
        GLOBAL.ThePlayer[target].text:SetString(text)
        if backgrounds[target] then
            print("[UpdateText] Showing background for:", target)
            backgrounds[target]:Show()
        end
        GLOBAL.ThePlayer:DoTaskInTime(duration, function()
            if GLOBAL.ThePlayer[target].text:GetString() == text then
                print("[UpdateText] Clearing text for target:", target)
                GLOBAL.ThePlayer[target].text:SetString("")

                if backgrounds[target] then
                    print("[UpdateText] Hiding background for:", target)
                    backgrounds[target]:Hide()
                end
            else
                print("[UpdateText] Text changed before timeout, skipping clear.")
            end
        end)
    else
        print("[UpdateText] Target not found or ThePlayer is nil")
    end
end

local function OnPlayerInit(inst)
    inst:DoTaskInTime(0, function()
        AddTextWidgetToPlayer(GLOBAL.ThePlayer, "announcement")
        AddTextWidgetToPlayer(GLOBAL.ThePlayer, "announcementdescription")
        AddTextWidgetToPlayer(GLOBAL.ThePlayer, "warning")
        AddTextWidgetToPlayer(GLOBAL.ThePlayer, "information")
        AddTextWidgetToPlayer(GLOBAL.ThePlayer, "informationdescription")
    end)
end

local function ClientAnnouncementHandler(json)
    print("[ClientAnnouncementHandler] Received JSON:", json)
    if not (GLOBAL.TheWorld) then
        print("[ClientAnnouncementHandler] TheWorld is nil, skipping.")
        return
    end
    local data = type(json) == "table" and json or GLOBAL.json.decode(json) or nil
    if not data then
        print("[ClientAnnouncementHandler] Failed to decode JSON.")
        return
    end
    print("[ClientAnnouncementHandler] Parsed data:", data)
    local type = data.type
    local title = data.title
    local description = data.description
    print("[ClientAnnouncementHandler] Type:", type, "Title:", title, "Description:", description)
    if type == "announcement" then
        GLOBAL.UpdateText(title, "announcement", 12)
        GLOBAL.UpdateText(description, "announcementdescription", 12)
    elseif type == "information" then
        GLOBAL.UpdateText(title, "information", 12)
        GLOBAL.UpdateText(description, "informationdescription", 12)
    else
        print("[ClientAnnouncementHandler] Unknown type:", type)
    end
end

AddClientModRPCHandler("ashleyclientannouncement", "message", ClientAnnouncementHandler)
AddPlayerPostInit(OnPlayerInit)

print("[Ashley] Announcements-Module loaded successfully!")
