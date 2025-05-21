const { getServer, addServerMessage } = require("../../scripts/serverlist");
require("dotenv").config();

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const timeStart = body.value.starttime;
    const timeEnd = Date.now();
    const latency = Math.round(timeEnd - timeStart);
    addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Pong! ${latency > 10000 ? latency / 1000 : latency}ms`, name: "Willow", type: "willow" } }, serverId);
}