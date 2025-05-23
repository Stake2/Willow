const { getClientChannel } = require('../../discord');
const { getServer, updateServerDay } = require('../../scripts/serverlist');
const { print } = require('../../utils/output');
const dictionary = require('../../jsons/dictionary.json');

module.exports = (body, res) => {
  const serverId = body.serverid || body.serverId;
  const server = getServer(serverId);
  if (!server) return;
  const channel = server.channel;
  getClientChannel(channel).then(channel => {
    if (!channel) return;
    if (!channel) return;
    if (!body.value.states) return;
    const season = body.value.states.season;
    function validateMoon(state) {
      if (state.isnewmoon == 'newmoon') return 'Nova';
      else if (state.isfullmoon == 'fullmoon') return 'Cheia';
      else return 'Crescente';
    }
    let moonphase = validateMoon(body.value.states);
    const day = body.value.states.cycles + 1;
    channel.send({ content: day == 1 ? '`Nova oportunidade,` <@&1236354182215237742>' : '', embeds: [{ color: 0x307681, title: `\`🌅\` · Amanhece um novo dia...`, description: `- A Constante perdura por **${day}** dias.\n- O **Alter** está na forma **${moonphase}**.\n- São brisas cortantes de **${dictionary[season] ? dictionary[season] : season}**!`, thumbnail: { url: 'https://media.discordapp.net/attachments/1270552171041263658/1338933111026614302/image.png?ex=67ace221&is=67ab90a1&hm=95d8390c733d5e948d851a6b322ba09dd319871e145d58414f37f93032fe7135&=&format=webp&quality=lossless' } }] }).catch(error => {
      print(`[Error] Application error: ${error}`);
    });
    updateServerDay(serverId, day, season, body.value.states.isalterawake || false);
  });
};
