const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { getServer } = require("../../scripts/serverlist");
const { print } = require("../../utils/output");

let lastMessage = '';

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        const map = { eat: { color: 0x9266CC, message: `\`🍇\` **· ${body.value.doer} \`${body.value.userid}\` está comendo ${body.value.victim}!**` }, burn: { color: 0xFF6723, message: `\`🔥\` · **${body.value.doer} \`${body.value.userid}\` está queimando ${body.value.victim}!**` }, break: { color: 0x989EA2, message: `\`🦏\` · **${body.value.doer} \`${body.value.userid}\` está quebrando ${body.value.victim}!**` } };
        if (lastMessage == map[body.value.key].message) return;
        channel.send({ embeds: [buildEmbed({ color: map[body.value.key].color || 0x4CB963, description: map[body.value.key].message })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        lastMessage = map[body.value.key].message;
    });
}