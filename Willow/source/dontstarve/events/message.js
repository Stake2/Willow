const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { getServer } = require("../../scripts/serverlist");
const { print } = require("../../utils/output");
const dictionary = require("../../jsons/dictionary.json");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        if (body.value.whisper === true) return;
        if (body.value.cave === true) return;
        const MAX_DISCORD_MESSAGE_LENGTH = 300;
        const msg = body.value.message.length > MAX_DISCORD_MESSAGE_LENGTH ? body.value.message.substring(0, MAX_DISCORD_MESSAGE_LENGTH - 3) + "(...)" : body.value.message;
        channel.send({ embeds: [buildEmbed({ description: `\`✉️\` **· ${body.value.name} \`${body.value.prefab == '' ? "Seleção" : dictionary[body.value.prefab] || body.value.prefab}\`** *▸* ${msg}`, color: 0x37373E })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    });
}