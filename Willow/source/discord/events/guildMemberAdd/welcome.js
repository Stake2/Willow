const { getClientChannel, getClientStatus } = require("../../../discord");
const { print } = require("../../../utils/output");
const { buildEmbed } = require("../../embeds");

require("dotenv").config();

module.exports = async member => {
    if(!getClientStatus()) return;
    const channel = await getClientChannel(process.env.DISCORD_CHANNEL_WELCOME);
    channel.send({ content: `-# Olá ${member}, veio queimar a base?`, embeds: [buildEmbed({ title: `\`🔥\` · Bem-vindo(a) ${member.displayName}`, description: `- Leia o nosso <#${process.env.DISCORD_CHANNEL_GUIDE}>\n- Compartilhe ideias em <#${process.env.DISCORD_CHANNEL_GENERAL}>\n- E fique por dentro das <#${process.env.DISCORD_CHANNEL_NEWS}>`, thumbnail: member.user.displayAvatarURL(), color: 0x86D68A })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
};