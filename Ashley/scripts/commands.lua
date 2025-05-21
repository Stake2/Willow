print("[Ashley] Commands-Module is loading...")

local GLOBAL = GLOBAL or _G

local function DummyRPCHandler(player)
    print("[Ashley] Sending RPC...")
end

AddModRPCHandler("ashleyservercommand", "message", DummyRPCHandler)

local COMMAND_RPC = GetModRPC("ashleyservercommand", "message")

AddUserCommand("global", {
    aliases = {},
    prettyname = function() return "/global" end,
    desc = function() return "Message all servers!" end,
    permission = GLOBAL.COMMAND_PERMISSION.USER,
    slash = true,
    usermenu = false,
    params = {},
    serverfn = function(params, caller)
    end,
    clientfn = function(params, caller)
    end,
})

AddUserCommand("dm", {
    aliases = {},
    prettyname = function() return "/dm" end,
    desc = function() return "Send private messages." end,
    permission = GLOBAL.COMMAND_PERMISSION.USER,
    slash = true,
    usermenu = false,
    params = {},
    serverfn = function(params, caller)
    end,
    clientfn = function(params, caller)
    end,
})

AddUserCommand("crabby", {
    aliases = {},
    prettyname = function() return "/crabby" end,
    desc = function() return "Dance like a crab!" end,
    permission = GLOBAL.COMMAND_PERMISSION.USER,
    slash = true,
    usermenu = false,
    params = {},
    serverfn = function(params, caller)
    end,
    clientfn = function(params, caller)
    end,
})

AddUserCommand("tango", {
    aliases = {},
    prettyname = function() return "/tango" end,
    desc = function() return "Tango is so fire..." end,
    permission = GLOBAL.COMMAND_PERMISSION.USER,
    slash = true,
    usermenu = false,
    params = {},
    serverfn = function(params, caller)
    end,
    clientfn = function(params, caller)
    end,
})

AddUserCommand("look", {
    aliases = {},
    prettyname = function() return "/look" end,
    desc = function() return "Take a look at the horizon..." end,
    permission = GLOBAL.COMMAND_PERMISSION.USER,
    slash = true,
    usermenu = false,
    params = {},
    serverfn = function(params, caller)
    end,
    clientfn = function(params, caller)
    end,
})

AddClassPostConstruct("screens/chatinputscreen", function(self)
    local OldRun = self.Run
    function self:Run()
        local input = self.chat_edit:GetString()
        if input and input:sub(1, 1) == "/" then
            local command_line = input:sub(2)
            local cmd, args = command_line:match("^(%S+)%s*(.*)$")
            local json = GLOBAL.json.encode({ userid = GLOBAL.ThePlayer.userid, command = cmd, arguments = args })
            SendModRPCToServer(COMMAND_RPC, json)
        end
        return OldRun(self)
    end
end)

print("[Ashley] Commands-Module loaded!")
