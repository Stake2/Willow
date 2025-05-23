const { getClientChannel } = require('../../discord');
const { getMods, getDisallowedMods } = require('../../scripts/modlist');
const { getServer } = require('../../scripts/serverlist');
const { addSoftban, removeSoftban } = require('../../scripts/softban');
const { print } = require('../../utils/output');
const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

async function fetchModDetails(modIds) {
  const postData = querystring.stringify({
    itemcount: modIds.length,
    ...Object.fromEntries(modIds.map((id, i) => [`publishedfileids[${i}]`, id]))
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.steampowered.com',
        path: '/ISteamRemoteStorage/GetPublishedFileDetails/v1/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.response.publishedfiledetails);
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function getDisallowedModsFromList(modIds) {
  const disallowed = await getDisallowedMods();
  const filtered = {};
  for (const modId of modIds) {
    if (modId in disallowed) {
      filtered[modId] = disallowed[modId];
    }
  }
  return filtered;
}

module.exports = (body, res) => {
  const serverId = body.serverid || body.serverId;
  const server = getServer(serverId);
  if (!server) return;
  getClientChannel(process.env.DISCORD_CHANNEL_LOG).then(async channel => {
    if (!channel) return;
    const modIds = Object.values(body.value)
      .slice(0, -2)
      .map(modId => modId.replace('workshop-', ''));
    const currentMods = await getMods();
    const mods = modIds.filter(modId => !(modId in currentMods));
    if (mods) {
      if (mods.length > 0) {
        const details = await fetchModDetails(mods);
        const formattedMods = details
          .map(mod => {
            const name = mod.title || 'Desconhecido';
            const id = mod.publishedfileid;
            const link = `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`;
            return `**${name}** | \`${id}\` *|* **[Workshop](${link})**\n\`/addmod id:${id} nome:"${name}" permitido:true\``;
          })
          .join('\n\n');
        channel.send({ embeds: [{ color: 0x4cb963, description: `\`💻\` **· Modlist de ${body.value.name} ${body.value.userid}**\n${formattedMods}` }] }).catch(error => print(`[Error] Application error: ${error}`));
      }
    }
    const disallowedMods = await getDisallowedModsFromList(modIds);
    if (Object.keys(disallowedMods).length > 0) {
      addSoftban(body.value.userid, disallowedMods);
      const formatted = Object.entries(disallowedMods).map(([id, mod]) => `**${mod.name}** *|* \`${id}]\``).join('\n');
      channel.send({ embeds: [{ color: 0xf8312f, description: `\`⛔\` **· Mods não permitidos de ${body.value.name}**\n${formatted}` }] }).catch(error => print(`[Error] Application error: ${error}`));
    } else removeSoftban(body.value.userid);
  });
};
