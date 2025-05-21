const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { addCheater } = require("../../scripts/monitor");
const { getServer } = require("../../scripts/serverlist");
const { print } = require("../../utils/output");
const dictionary = require("../../jsons/dictionary.json");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        channel.send({ content: `-# O usuário está usando \`${dictionary[body.value.prefab] || body.value.prefab}\``, embeds: [buildEmbed({ color: 0x635994, description: `\`🐈‍⬛\` **· ${body.value.name} \`${body.value.userid}\` tem visão noturna.**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        addCheater(body.value.userid, serverId);
    });
}