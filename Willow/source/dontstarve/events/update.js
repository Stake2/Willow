const { getServer, deleteServerOldMessages } = require("../../scripts/serverlist");
const { print } = require("../../utils/output");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId || body.server_id;
    const server = getServer(serverId);
    if (!server) return print(`[Warn] No server found: ${serverId}`);
    const content = server.messages;
    server.cooldown = 0;
    if (!content || content.length < 1) return;
    try {
        res.send(JSON.stringify(content));
    } catch (error) {
        print(`[Error] Application error: ${error}`);
    } res.on('finish', () => {
        deleteServerOldMessages(serverId);
    });
}