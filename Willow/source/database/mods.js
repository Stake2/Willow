const { databaseQuery } = require("../postgre");

async function databaseModsGetMods() {
    const res = await databaseQuery("SELECT * FROM mods");
    return res.rows;
}

async function databaseModsGetAllowed() {
    const res = await databaseQuery("SELECT * FROM mods WHERE allowed = true");
    return res.rows;
}

async function databaseModsGetDisallowed() {
    const res = await databaseQuery("SELECT * FROM mods WHERE allowed = false");
    return res.rows;
}

async function databaseModsCreateMod(id, allowed) {
    const res = await databaseQuery("INSERT INTO mods (mod_id, allowed) VALUES ($1, $2) ON CONFLICT (mod_id) DO NOTHING", [id, allowed]);
    return res.rowCount > 0;
}

async function databaseModsDeleteMod(id) {
    const res = await databaseQuery("DELETE FROM mods WHERE mod_id = $1", [id]);
    return res.rowCount > 0;
}

module.exports = { databaseModsGetMods, databaseModsGetAllowed, databaseModsGetDisallowed, databaseModsCreateMod, databaseModsDeleteMod };