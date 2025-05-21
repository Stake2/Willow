const { getClientChannel } = require("../../discord");
const { updateMonitor, validateHash } = require("../../scripts/monitor");
const { getServer } = require("../../scripts/serverlist");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        updateMonitor(body.value.userid, serverId);
        validateHash(body.value, serverId);
    });
}