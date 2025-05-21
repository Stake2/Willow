const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");

module.exports = (body, res, server) => {
    getClientChannel(server.channel).then((channel) => {
        channel.send({ content: `-# Hey, <@&1337837399690186803>!`, embeds: [buildEmbed({ description: `\`📢\` · **${body.value.name} \`(${body.value.userid})\` precisa de ajuda!**`, color: 0xCA0B4A })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    });
}