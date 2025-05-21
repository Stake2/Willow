const { print } = require("../utils/output.js");
const { addServerMessage } = require("./serverlist.js");

function serverBan(userId, serverId, channel) {
    print(`[Log] Banning: ${userId} from ${serverId}`);
    addServerMessage({ key: "ban", value: { userid: userId, duration: 2 * 3600 } }, serverId);
    channel.send({ embeds: [{ color: 0x62417F, description: `\`🫂\` · **Banindo \`${userId}\` por \`02\` horas...**` }] }).catch((error) => { print(`[Error] Application error: ${error}`); });
}

module.exports = { serverBan }