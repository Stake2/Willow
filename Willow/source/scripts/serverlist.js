const { databaseServersGetServers, databaseServersUpdateServer } = require("../database/servers");
const { print } = require("../utils/output");
require("dotenv").config();

let uniqueServers = {};
let servers = {};

function getServer(server) {
    if (!servers[server]) return null;
    return servers[server];
}

function updateServerDay(serverId, day, season, remaining, rift) {
    if (!servers[serverId]) return null;
    servers[serverId].day = day;
    databaseServersUpdateServer(serverId, season, remaining, rift);
}

function getServers() {
    return uniqueServers;
}

function addServerMessage(table, server) {
    if (!servers[server]) return;
    if (servers[server]?.cooldown > 30) return;
    servers[server].messageCount++;
    table.id = servers[server].messageCount;
    servers[server].messages.push(table);
}

function addServersMessage(table) {
    for (const server of Object.values(uniqueServers)) {
        addServerMessage(table, server.id);
    }
}

function deleteServerOldMessages(server) {
    servers[server].messages = servers[server].messages.filter((message) => message.id > servers[server].messageCount);
}

async function setupServers() {
    const rows = await databaseServersGetServers();
    for (const row of rows) {
        let server = {
            id: row.id,
            identity: row.identity,
            channel: row.discord_channel,
            messages: [],
            cooldown: 0,
            day: 1,
            messageCount: 0
        };
        servers[row.identity] = server;
        servers[row.discord_channel] = server;
        servers[row.id] = server;
        uniqueServers[row.identity] = server;
        print(`[Setup] Server set: ${servers[row.identity].identity} : ${servers[row.identity].channel}`);
        addServerMessage({ key: "message", value: { message: `Olá, acabei de reiniciar!`, name: "Willow", type: "willow" } }, server.identity);
    }
}

function callMonitor() {
    for (const server in uniqueServers) {
        const information = { channelId: process.env.DISCORD_CHANNEL_LOG, messageId: null };
        addServerMessage({ key: "userlist", value: { interaction: information } }, server.identity);
    }
}

setInterval(() => {
    for (const key in servers) {
        servers[key].cooldown += 1;
        if (servers[key].cooldown >= 30) {
            servers[key].messages = [];
            servers[key].cooldown = 0;
        }
    }
}, 1000);

module.exports = { getServer, updateServerDay, getServers, setupServers, addServerMessage, addServersMessage, deleteServerOldMessages, callMonitor };