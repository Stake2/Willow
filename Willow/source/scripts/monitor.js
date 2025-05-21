const { print } = require("../utils/output");
const { addServerMessage } = require("./serverlist");
require("dotenv").config();

let hashWhitelist = {
    37064199: true, 612883454: true, 2619173: true, 27909233: true,
    37125049: true, 613162454: true, 2636023: true, 27968033: true
};

const hashLives = {};
const hashUsage = {};

let monitor = {}
let cheaters = {}

function validateHash(value, serverId) {
    const allHashes = [
        value.gethash,
        value.checkplayer,
        value.functionshash,
        value.simplehash || value.simpleshash,
    ];
    for (const hash of allHashes) {
        if (!hash) continue;
        if (!hashUsage[hash]) {
            hashUsage[hash] = new Set();
        }
        hashUsage[hash].add(value.userid);
    }
    const allValid = allHashes.every(hash => hashWhitelist[hash]);
    if (!allValid) {
        const uniqueUsers = new Set();
        for (const hash of allHashes) {
            if (hashUsage[hash]) {
                for (const uid of hashUsage[hash]) {
                    uniqueUsers.add(uid);
                }
            }
        }
        print(`[Warn] Ashley modified by: ${value.userid} on  ${serverId} : [${value.gethash}, ${value.checkplayer}, ${value.functionshash}, ${value.simplehash || value.simpleshash}]`);
        print(`[Warn] This Hash was encountered on: ${uniqueUsers.size} distinct users.`);
        if (!hashLives[value.userid]) {
            hashLives[value.userid] = 0;
        }
        hashLives[value.userid] += 1;
        addServerMessage({ key: "message", value: { userid: value.userid, message: `Você está usando uma versão minha desatualizada. Aviso ${hashLives[value.userid]}/3`, name: "Ashley", type: "ashley" } }, serverId);
        if (hashLives[value.userid] > 3) {
            addServerMessage({ key: "message", value: { message: `Banindo ${value.name} temporariamente...`, name: "Server", type: "server" } }, serverId);
            addServerMessage({ key: "message", value: { message: `Isso simboliza um banimento, por favor, leve os avisos a sério.`, name: "Willow", type: "willow" } }, serverId);
        }
    }
}

function createMonitor(userId, serverId) {
    if (!monitor[userId]) {
        monitor[userId] = {
            userid: userId,
            lastcheck: Date.now(),
            server: serverId,
            murderer: false
        };
    }
}

function getMonitor(userId, serverId) {
    if (!monitor[userId]) createMonitor(userId, serverId);
    if (Date.now() - monitor[userId].lastcheck > 1000 * 60 * 10) monitor[userId].murderer = true;
    return monitor[userId] || null;
}

function updateMonitor(userId, serverId) {
    if (!monitor[userId]) createMonitor(userId, serverId);
    monitor[userId].lastcheck = Date.now();
    monitor[userId].server = serverId;
    return monitor[userId];
}

function deleteMonitor(userId) {
    if (monitor[userId]) delete monitor[userId];
}

function addCheater(userId, server) {
    if (!cheaters[userId]) cheaters[userId] = 0
    cheaters[userId]++;
    if (cheaters[userId] % 3 == 0) {
        addServerMessage({ key: "terminal", value: { message: "for _, player in ipairs(AllPlayers) do if player.userid == '" + userId + "' then player.components.health:DoDelta(-9999, true) break end end" } }, server)
    }
}

function clearCheaters() {
    cheaters = {}
}

module.exports = { validateHash, createMonitor, getMonitor, updateMonitor, deleteMonitor, addCheater, clearCheaters }