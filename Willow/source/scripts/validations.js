const { getClientStatus } = require("../discord");
const { embedNoPermission, embedBusy } = require("../discord/embeds");

function validateStaff(interaction = null, shouldAcuse = true) {
    if (!interaction) return false;
    if (!interaction.member) return false;
    if (interaction.member.roles.cache.has("1337837399690186803")) return true;
    if (!shouldAcuse) return false;
    embedNoPermission(interaction);
    return false;
}

function validateServer(interaction = null) {
    const status = getClientStatus();
    if (status == 1) return true;
    if (!interaction) return false;
    if (!interaction.member) return false;
    embedBusy(interaction);
    return false;
}

module.exports = { validateStaff, validateServer };