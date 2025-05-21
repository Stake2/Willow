const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { addCheater } = require("../../scripts/monitor");
const { getServer, addServerMessage } = require("../../scripts/serverlist");
const { serverBan } = require("../../scripts/serverutils");
const { print } = require("../../utils/output");
const dictionary = require("../../jsons/dictionary.json");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        channel.send({ content: `-# O usuário está usando \`${dictionary[body.value.prefab] || body.value.prefab}\` \`${body.value.quantity}\``, embeds: [buildEmbed({ color: 0x0074BA, description: `\`🌎\` **· ${body.value.name} \`${body.value.userid}\` tem visão massiva.**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        addCheater(body.value.userid, serverId);
        if (body.value.quantity > 180) {
            serverBan(body.value.userid, serverId, channel);
            addServerMessage({ key: "message", value: { message: `Punindo ${body.value.name}...`, name: "Ashley", type: "ashley" } }, serverId);
        }
    });
}