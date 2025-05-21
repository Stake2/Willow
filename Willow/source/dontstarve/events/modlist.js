const { getClientChannel } = require("../../discord");
const { getMods, getDisallowedMods } = require("../../scripts/modlist");
const { getServer } = require("../../scripts/serverlist");
const { addSoftban, removeSoftban } = require("../../scripts/softban");
const { print } = require("../../utils/output");
require("dotenv").config();

async function getDisallowedModsFromList(modIds) {
    const disallowed = await getDisallowedMods();
    return modIds.filter(modId => modId in disallowed);
}

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId;
    const server = getServer(serverId);
    if (!server) return;
    getClientChannel(process.env.DISCORD_CHANNEL_LOG).then(async (channel) => {
        if (!channel) return;
        const modIds = Object.values(body.value).slice(0, -2).map(modId => modId.replace("workshop-", ""));
        const currentMods = await getMods();
        const mods = modIds.filter(modId => !(modId in currentMods));
        if (mods) {
            if (mods.length > 0) {
                const formattedMods = mods.map(mod => `\`${mod}\``).join(" ");
                channel.send({ embeds: [{ color: 0x4CB963, description: `\`💻\` **· Modlist Não-Filtrada de ${body.value.name}**\n- ${formattedMods}` }] }).catch((error) => { print(`[Error] Application error: ${error}`); });
            }
        }
        const disallowedMods = await getDisallowedModsFromList(modIds);
        if (disallowedMods.length > 0) {
            addSoftban(body.value.userid, disallowedMods);
            const formatted = disallowedMods.map(mod => `\`${mod}\``).join(" ");
            channel.send({ embeds: [{ color: 0xF8312F, description: `\`⛔\` **· Mods não permitidos de ${body.value.name}**\n- ${formatted}` }] }).catch(error => print(`[Error] Application error: ${error}`));
        } else {
            removeSoftban(body.value.userid);
        }
    });
}