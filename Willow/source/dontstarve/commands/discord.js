const { addServerMessage } = require("../../scripts/serverlist");

module.exports = (body, res, server) => {
    addServerMessage({ key: "message", value: { userid: body.value.userid, message: `discord.gg/G8hxdzZ6rN`, name: "Discord", type: "discord" } }, server.identity);
}