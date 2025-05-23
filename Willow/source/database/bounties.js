const { databaseQuery } = require('../postgre');

async function databaseBountiesGetBounties(serverId) {
  let res = await databaseQuery('SELECT bounties.*, bosses.name AS name, bosses.prefab AS prefab, bosses.points AS points FROM bounties JOIN bosses ON bounties.boss_id = bosses.id WHERE bounties.server_id = $1', [serverId]);
  if (res.rows.length === 0) {
    await databaseQuery('CALL generate_bounties($1)', [parseInt(serverId)]);
    res = await databaseQuery('SELECT bounties.*, bosses.name AS name, bosses.prefab AS prefab, bosses.points AS points FROM bounties JOIN bosses ON bounties.boss_id = bosses.id WHERE bounties.server_id = $1', [serverId]);
  }
  return res.rows;
}

async function databaseBountiesDeleteBounty(prefab, serverId) {
  const res = await databaseQuery('SELECT delete_and_refill_bounty($1, $2)', [prefab, serverId]);
  return res.rows[0].delete_and_refill_bounty === true;
}

module.exports = { databaseBountiesGetBounties, databaseBountiesDeleteBounty };
