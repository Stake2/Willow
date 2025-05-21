const path = require("path");
const fs = require("fs");

const confirmationHandlers = {};
const pendingConfirmations = {};
const confirmationHandlersDir = path.join(__dirname, "./confirmations");

fs.readdirSync(confirmationHandlersDir).forEach(file => {
    if (file.endsWith(".js")) {
        const key = path.basename(file, ".js");
        confirmationHandlers[key] = require(path.join(confirmationHandlersDir, file));
    }
});

function createConfirmation(user_id, member, type, extra = {}) {
    pendingConfirmations[member.id] = { user_id, discord_id: member.id, type, member, ...extra };
    setTimeout(() => {
        delete pendingConfirmations[member.id];
    }, 1000 * 70);
}

function handleConfirmation(interaction, shouldRun = true) {
    if (!interaction) return false;
    const data = pendingConfirmations[interaction.user.id];
    if (!data) return false;
    if (shouldRun && confirmationHandlers[data.type]) confirmationHandlers[data.type](data);
    delete pendingConfirmations[interaction.user.id];
    return true;
}

module.exports = { createConfirmation, handleConfirmation };
