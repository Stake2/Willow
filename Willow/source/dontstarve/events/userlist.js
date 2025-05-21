const { getClientChannel } = require("../../discord");
const { getMonitor, updateMonitor } = require("../../scripts/monitor");
const { getServer } = require("../../scripts/serverlist");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const users = body.value.users;
    if (body.value.interaction.messageid == null) {
        for (const user in users) {
            const monitor = getMonitor(users[user].userid, serverId);
            if (user.prefab == "") monitor.murderer = false;
            if (!monitor.murderer) return updateMonitor(users[user].userid, serverId);
            print(`[Warn] Ashley murdered by: ${users[user].userid} on ${serverId}`);
        }
        return;
    }
    let formattedUsers = null;
    if (!users || typeof users !== "object") { console.error("[Error] Lista de usuários inválida."); }
    else { formattedUsers = Object.values(users).map((user, index) => `\`${String(index + 1).padStart(2, "0")}.\` ${user.name} \`(${user.userid})\``).join("\n"); }
    getClientChannel(body.value.interaction.channelid).then((channel) => {
        if (!channel) return;
        channel.messages.fetch(body.value.interaction.messageid).then((message) => {
            message.edit({ embeds: [{ color: 0x77B255, title: `\`🏡\` · Usuários de: \`${body.serverId}\``, description: formattedUsers }] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }).catch((error) => { print(`[Error] Application error: ${error}`); });
}