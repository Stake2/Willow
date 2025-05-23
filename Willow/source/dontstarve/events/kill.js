const { databaseBossesGetBoss } = require('../../database/bosses');
const { databaseBountiesDeleteBounty } = require('../../database/bounties');
const { databaseUsersMassGivePoints } = require('../../database/users');
const { getClientChannel } = require('../../discord');
const { getServer } = require('../../scripts/serverlist');
const { print } = require('../../utils/output');

const bosses = {};

module.exports = (body, res) => {
  const serverId = body.serverid || body.serverId;
  const server = getServer(serverId);
  if (!server) return;
  const channel = server.channel;
  getClientChannel(channel).then(async channel => {
    if (!channel) return;
    let players = Object.values(body.value.players) || null;
    if (!players) return;
    if (body.value.victim.startsWith('enraged_')) body.value.victim = body.value.victim.slice('enraged_'.length);
    if (!bosses[body.value.victim]) bosses[body.value.victim] = await databaseBossesGetBoss(body.value.victim);
    if (!bosses[body.value.victim]) return;
    const boss = bosses[body.value.victim];
    channel.send({ embeds: [{ color: 0xc84937, title: `\`🏟️\` · ${boss.name} caiu!`, description: `- Que perigo! Isso foi **intenso**!\n- Foi **${body.value.doer || 'Charlie'} quem o derrubou**.\n- Outro(s) **0${players.length - 1}** estão presentes.`, thumbnail: { url: 'https://media.discordapp.net/attachments/1270552171041263658/1343495140702027776/image.png?ex=67bd7ada&is=67bc295a&hm=5ce03cab9ab65c4b76ebf9126377720f73b5dfebdbd1a5da5f42ea9bce05a456&=&format=webp&quality=lossless' } }] }).catch(error => {
      print(`[Error] Application error: ${error}`);
    });
    const killed = await databaseBountiesDeleteBounty(body.value.victim, server.id);
    const helpers = body.value.helpers ? Object.values(body.value.helpers) : null;
    print(`[Log] ${boss.name} defeated: ${killed ? 'Bountiful' : 'Unbountiful'}`);
    if (!killed) return databaseUsersMassGivePoints(players, 1, helpers, serverId);
    databaseUsersMassGivePoints(players, boss.points, helpers, serverId);
  });
};
