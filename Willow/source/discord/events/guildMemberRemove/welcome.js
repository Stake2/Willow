const { getClientChannel, getClientStatus } = require("../../../discord");
const { print } = require("../../../utils/output");
const { buildEmbed } = require("../../embeds");

require("dotenv").config();

module.exports = async member => {
    if(!getClientStatus()) return;
    const channel = await getClientChannel(process.env.DISCORD_CHANNEL_WELCOME);
    channel.send({ embeds: [buildEmbed({ title: `\`🚪\` · Adeus, ${member.displayName}...`, description: `- Por que será que ele(a) se foi?\n- Queimar tudo não será igual...\n- \\**insira música de funeral\\**`, thumbnail: member.user.displayAvatarURL(), color: 0xD35B52 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
};