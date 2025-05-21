const { Client, GatewayIntentBits } = require("discord.js");
const { printMajorError, print } = require("./utils/output");
const { CommandKit } = require("commandkit");
const path = require("path");
require("dotenv").config();

let clientData = {
    client: null,
    guild: null,
    members: {},
    roles: {},
    channels: {},
    status: 0
};

function clearClientData() {
    clientData.members = [];
    clientData.roles = [];
    clientData.channels = [];
    print("[Log] Data cleared from: Discord Client");
}

async function loginDiscordClient(clientData, commandKit, retries = 3, delay = 5000) {
    try {
        await clientData.client.login(process.env.DISCORD_CLIENT_TOKEN);
    } catch (error) {
        printMajorError(`[Error] Application error: ${error.message}`);
        if (retries > 0) {
            print(`[Warn] Retrying in: ${delay / 1000} seconds...`);
            setTimeout(() => loginDiscordClient(clientData, retries - 1, delay * 2), delay);
        } else printMajorError(`[Error] Failed to connect to Discord client: ${error.message}`);
    }
}

async function setupDiscord() {
    clientData.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,], });
    const commandKit = new CommandKit({ client: clientData.client, commandsPath: path.join(__dirname, './discord/commands'), eventsPath: path.join(__dirname, './discord/events') });
    await loginDiscordClient(clientData, commandKit, -1, 5000);
}

async function setClientGuild() {
    clientData.guild = await clientData.client.guilds.fetch(process.env.DISCORD_GUILD_ID).catch((error) => { print(`[Error] Application error: ${error}`); });
    print(`[Setup] Discord guild set: ${clientData.guild.name}`);
    setClientStatus(1);
}

async function getClientGuild() {
    let guild = clientData.guild;
    return guild || null;
}

function getClientStatus() {
    return clientData.status;
}

function setClientStatus(status) {
    clientData.status = status;
    const map = { 0: "Busy", 1: "Available" }
    print(`[Setup] Discord status set: ${map[status]}`);
}

async function getClientMember(id) {
    if (!clientData.members) clientData.members = {};
    let member = clientData.members[id] ? clientData.members[id] : null;
    if (member) return member;
    member = await clientData.guild.members.fetch(id).catch((error) => { print(`[Error] Application error: ${error}`); });
    if (member) clientData.members[id] = member;
    return member || null;
}

async function getClientRole(id) {
    if (!clientData.roles) clientData.roles = {};
    let role = clientData.roles[id] ? clientData.roles[id] : null;
    if (role) return role;
    role = await clientData.guild.roles.fetch(id).catch((error) => { print(`[Error] Application error: ${error}`); });
    if (role) clientData.roles[id] = role;
    return role || null;
}

async function getClientChannel(id) {
    if (!clientData.channels) clientData.channels = {};
    let channel = clientData.channels[id] ? clientData.channels[id] : null;
    if (channel) return channel;
    channel = await clientData.guild.channels.fetch(id).catch((error) => { print(`[Error] Application error: ${error}`); });
    if (channel) clientData.channels[id] = channel;
    return channel || null;
}

setInterval(() => {
    clearClientData();
}, 60 * 60 * 1000);

module.exports = { setupDiscord, getClientGuild, getClientMember, getClientRole, getClientChannel, getClientStatus, setClientGuild }