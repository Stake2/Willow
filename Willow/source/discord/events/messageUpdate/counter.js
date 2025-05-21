const { minigameStats } = require("../../../scripts/fruitycounter");
const { getClientStatus } = require("../../../discord");
const { buildEmbed } = require("../../embeds");
require("dotenv").config();

module.exports = async (oldMessage, message) => {
    if (!getClientStatus()) return;
    if (!message.guild) return;
    if (message.channel.id != process.env.DISCORD_CHANNEL_COUNTER) return;
    if (message.author.bot) return;
    if (message.id != minigameStats.lastMessageId) return;
    message.channel.send({ embeds: [buildEmbed({ description: `\`🌚\` **· Mensagem removida...**`, color: 0x8D65C5 })] });
}