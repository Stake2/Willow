const { databaseQuery } = require("../postgre");

async function databaseBossesGetBoss(prefab) {
    const res = await databaseQuery("SELECT * FROM bosses WHERE prefab = $1", [prefab]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
}

async function databaseBossesGetBosses() {
    const res = await databaseQuery("SELECT * FROM bosses");
    return res.rows;
}

module.exports = { databaseBossesGetBoss, databaseBossesGetBosses }