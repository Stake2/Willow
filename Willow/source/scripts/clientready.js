const { getClientChannel } = require("../discord");
const { buildEmbed } = require("../discord/embeds");
const { print } = require("../utils/output");

require("dotenv").config();

async function notifyChannels() {
    const channels = [await getClientChannel(process.env.DISCORD_CHANNEL_COUNTER)];
    const embedData = { description: "`💾` **· Reiniciei! Agora estou de volta.**", color: 0x635994 };
    for (const channel of channels) {
        if (!channel) continue;
        channel.messages.fetch({ limit: 1 }).then(msgs => {
            const lastMessage = msgs.first()
            if (lastMessage && lastMessage.embeds?.[0]?.description === embedData.description) return;
            channel.send({ embeds: [buildEmbed({ description: `\`💾\` **· Reiniciei! Agora estou de volta.**`, color: 0x635994 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        });
    }
}

function setupApplication() {
    notifyChannels();
}

module.exports = { setupApplication }