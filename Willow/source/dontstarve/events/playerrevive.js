const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { getServer } = require("../../scripts/serverlist");
const { rollDice } = require("../../utils/extras");
const { print } = require("../../utils/output");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then((channel) => {
        if (!channel) return;
        let target = "Charlie";
        let players = Object.values(body.value.players) || null;
        let playersLength = players.length || 0;
        if (playersLength > 0) {
            players = players.filter(player => player.userid !== body.value.userid);
            if (players.length > 1) {
                const dice = rollDice(0, players.length - 1)
                target = players[dice]?.name || "Charlie";
            }
        }
        channel.send({ embeds: [{ color: 0x7A5DBA, title: `\`🔮\` · ${body.value.name.slice(0, 12)} renasceu!`, description: `- **Algo** o trouxe de volta.\n- Será que **${target}** ajudou?\n- Nossa sanidade **restaura**!`, thumbnail: { url: "https://media.discordapp.net/attachments/1270552171041263658/1343494940440793139/image.png?ex=67bd7aaa&is=67bc292a&hm=e60319eae6482423211b85ccaf6dc05a5ed4c96d28c636cb6afb33cd798d2dd7&=&format=webp&quality=lossless" } }] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    });
}