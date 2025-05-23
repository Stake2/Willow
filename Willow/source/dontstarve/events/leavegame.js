const { getClientChannel } = require('../../discord');
const { buildEmbed } = require('../../discord/embeds');
const { getServer } = require('../../scripts/serverlist');
const { rollDice } = require('../../utils/extras');
const { print } = require('../../utils/output');

module.exports = (body, res) => {
  const serverId = body.serverid || body.serverId;
  const server = getServer(serverId);
  if (!server) return;
  const players = Object.values(body.value.players);
  if (!players) return;
  const player = body.value.name;
  let onlinePlayers = players.length - 1;
  const channel = server.channel;
  getClientChannel(channel).then(channel => {
    if (!channel) return;
    let target = 'Charlie';
    if (onlinePlayers > 0) {
      const dice = rollDice(0, onlinePlayers);
      target = players[dice].name || 'Charlie';
    }
    const firstLine = onlinePlayers > 1 ? `Há **0${players?.length || 0}** sobrevivente(s) em luto.` : `**Não restam** sobreviventes...`;
    channel.send({ embeds: [{ color: 0x875555, title: `\`🏚️\` · ${player.slice(0, 12)} saiu para sempre.`, description: `- ${firstLine}\n- **${target}** soa levemente confuso(a).\n- Há espaço para **0${body.value.maxplayers - (players?.length ? players.length : 0)}** pessoa(s).`, thumbnail: { url: 'https://media.discordapp.net/attachments/1270552171041263658/1343496222417096784/image.png?ex=67bd7bdc&is=67bc2a5c&hm=47b44c87be7424bf2b1138e3b1eb113659fc4b256cbaa27b172e16eb645c8f21&=&format=webp&quality=lossless' } }] }).catch(error => {
      print(`[Error] Application error: ${error}`);
    });
    channel.setTopic(`O servidor tem ${onlinePlayers}/${body.value.maxplayers} players online - Sobreviva para contar histórias aos que lutarem depois de você!`).catch(error => {
      print(`[Error] Application error: ${error}`);
    });
  });
};
