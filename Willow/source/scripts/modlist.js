const { databaseModsGetMods } = require("../database/mods");
const { print } = require("../utils/output");

let modlist = {}
let disallowedMods = {};

async function getMods() {
    return modlist;
}

async function getDisallowedMods() {
    return disallowedMods;
}

async function setupMods() {
    const rows = await databaseModsGetMods();
    let allowed = 0;
    let disallowed = 0;
    for (const row of rows) {
        modlist[row.mod_id] = row.allowed;
        if (row.allowed) allowed++;
        else {
            disallowed++;
            disallowedMods[row.mod_id] = { allowed: row.allowed };
        }
    }
    print(`[Setup] Modlist loaded: ${allowed} allowed : ${disallowed} disallowed`);
}

module.exports = { getMods, getDisallowedMods, setupMods };