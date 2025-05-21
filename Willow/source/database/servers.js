const { databaseQuery } = require("../postgre");

async function databaseServersGetServers() {
    const res = await databaseQuery("SELECT * FROM servers");
    return res.rows;
}

async function databaseServersUpdateServer(serverId, season, remaining, rift) {
    const res = await databaseQuery("UPDATE servers SET season = $1, season_length = $2, updated_at = CURRENT_DATE, rift = $4 WHERE identity = $3", [season, remaining, serverId, rift || false]);
    return res.rowCount > 0;
}

module.exports = { databaseServersGetServers, databaseServersUpdateServer }