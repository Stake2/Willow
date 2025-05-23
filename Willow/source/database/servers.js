const { databaseQuery } = require('../postgre');

async function databaseServersGetServers() {
  const res = await databaseQuery('SELECT * FROM servers');
  return res.rows;
}

async function databaseServersUpdateServer(serverId, season, rift) {
  const res = await databaseQuery('UPDATE servers SET season = $1, rift = $2 WHERE identity = $3', [season, rift || false, serverId]);
  return res.rowCount > 0;
}

module.exports = { databaseServersGetServers, databaseServersUpdateServer };
