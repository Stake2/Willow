const { getClientMember } = require("../../../discord");
const { getServer, addServerMessage } = require("../../../scripts/serverlist");
const { validateStaff } = require("../../../scripts/validations");

require("dotenv").config();

const mentionRegex = /<@!?(\d+)>/g;

module.exports = async (message, client) => {
    if (message.author.bot) return;
    if (!message.content) return;

    const serverId = message.channel.id;
    const server = getServer(serverId);
    if (!server) return;

    const admin = validateStaff(message, false);
    const MAX_DST_MESSAGE_LENGTH = 140;

    let truncatedMessage = message.content.length > MAX_DST_MESSAGE_LENGTH
        ? message.content.substring(0, MAX_DST_MESSAGE_LENGTH - 3) + "(...)"
        : message.content;

    const matches = [...truncatedMessage.matchAll(mentionRegex)];
    for (const match of matches) {
        const id = match[1];
        const member = await getClientMember(id);
        if (member) {
            const name = member.displayName || member.user?.username || "usuário";
            truncatedMessage = truncatedMessage.replace(match[0], `@${name}`);
        }
    }

    const messageData = {
        message: truncatedMessage,
        name: message.author.username,
        type: "discord"
    };

    addServerMessage({ key: "message", value: messageData }, server.identity);
};
