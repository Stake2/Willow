const { getClientRole, getClientMember } = require('../discord');
const { databaseQuery } = require('../postgre');
const { addServerMessage } = require('../scripts/serverlist');
const { validateSoftban, getSoftbanned } = require('../scripts/softban');
const { print } = require('../utils/output');

const allowedKeys = ['points', 'experience', 'currency'];

async function databaseUsersGetUser(user) {
  let res = await databaseQuery(`SELECT * FROM users WHERE user_id = $1`, [user.userid || user.userId || user.user_id]);
  if (res.rows.length === 0) {
    await databaseUsersCreateUser(user);
    res = await databaseQuery(`SELECT * FROM users WHERE user_id = $1`, [user.userid || user.userId || user.user_id]);
  }
  return res.rows[0];
}

async function databaseUsersGetUserByDiscordId(discordId) {
  const res = await databaseQuery(`SELECT u.*  FROM users u  JOIN accounts a ON u.id = a.user_id  WHERE a.provider = 'discord' AND a.account_id = $1`, [discordId]);
  if (res.rows.length === 0) return false;
  return res.rows[0];
}

async function databaseUsersGetDiscordIdByUserId(user) {
  const userCode = user.userid || user.userId || user.user_id;
  const res = await databaseQuery(`SELECT a.account_id FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.provider = 'discord' AND u.user_id = $1`, [userCode]);
  if (res.rows.length === 0) return false;
  return res.rows[0].account_id;
}

async function databaseUsersGetUsers() {
  const res = await databaseQuery('SELECT * FROM users');
  return res.rows;
}

async function databaseUsersGetTop(key, start, end) {
  if (!allowedKeys.includes(key)) return;
  const res = await databaseQuery(`SELECT * FROM users ORDER BY ${key} DESC LIMIT $1 OFFSET $2`, [end - start, start]);
  return res.rows;
}

async function databaseUsersCreateUser(user) {
  if (!user.userid || !user.name) return null;
  const result = await databaseQuery(`INSERT INTO users (user_id, name, points, experience, currency) VALUES ($1, $2, 0, 0, 0) ON CONFLICT (user_id) DO NOTHING;`, [user.userid, user.name.length > 16 ? user.name.slice(0, 16) : user.name]);
  const rowCount = result.rowCount > 0;
  if (rowCount) print(`[Log] User was registered: ${user.name}`);
  return rowCount;
}

async function databaseUsersGiveArtifact(user, artifactName) {
  const artifactRes = await databaseQuery('SELECT id FROM artifacts WHERE name = $1', [artifactName]);
  if (artifactRes.rows.length === 0) return false;
  const artifactId = artifactRes.rows[0].id;
  const userRes = await databaseQuery('SELECT id FROM users WHERE user_id = $1', [user.userid || user.userId || user.user_id]);
  if (userRes.rows.length === 0) return false;
  const userId = userRes.rows[0].id;
  await databaseQuery('INSERT INTO inventory (user_id, artifact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, artifactId]);
  return true;
}

async function databaseAccountsRegisterDiscord(user, discordId) {
  const userRes = await databaseQuery('SELECT id FROM users WHERE user_id = $1', [user.userid || user.userId || user.user_id]);
  if (userRes.rows.length === 0) return null;
  const userId = userRes.rows[0].id;
  const result = await databaseQuery(`INSERT INTO accounts (user_id, provider, account_id)VALUES ($1, 'discord', $2)ON CONFLICT (provider, account_id) DO NOTHING`, [userId, discordId]);
  return result.rowCount > 0;
}

async function databaseUsersValidateDiscord(user) {
  const res = await databaseQuery("SELECT EXISTS (SELECT 1 FROM users u JOIN accounts a ON a.user_id = u.id WHERE u.user_id = $1 AND a.provider = 'discord') AS has_discord", [user.userid || user.userId || user.user_id]);
  return res.rows[0]?.has_discord || false;
}

async function databaseUsersValidateDiscordByDiscordId(discordId) {
  const res = await databaseQuery("SELECT EXISTS (SELECT 1 FROM accounts WHERE provider = 'discord' AND account_id = $1) AS has_discord", [discordId]);
  return res.rows[0]?.has_discord || false;
}

async function databaseUsersValidateArtifact(user, artifactName) {
  const res = await databaseQuery('SELECT EXISTS (SELECT 1 FROM users u JOIN inventory ea ON ea.user_id = u.id JOIN artifacts a ON a.id = ea.artifact_id WHERE u.user_id = $1 AND a.name = $2) AS has_artifact', [user.userid || user.userId || user.user_id, artifactName]);
  return res.rows[0]?.has_artifact || false;
}

async function databaseUsersGivePoints(user, value, server = null, isHelper = false) {
  let quantity = value;
  let userData = await databaseUsersGetUser(user);
  if (!userData) return;
  if (quantity > 0) {
    const prefabMultipliers = { wes: 2, wonkey: 1.6, wilson: 1.4, warly: 1.2, wormwood: 1.1, wx78: 1.1, wanda: 0.9, wurt: 0.8, winona: 0.8, wolfgang: 0.8, waxwell: 0.7, wortox: 0.7 };
    if (user.prefab in prefabMultipliers) quantity *= prefabMultipliers[user.prefab];
    if (!isHelper) quantity *= 0.2;
    quantity = Math.floor(quantity * 10) / 10;
  }
  const points = Math.max(0, Number(userData.points) + quantity);
  const exp = Math.max(Number(userData.experience), Number(userData.experience) + quantity);
  const money = Math.max(0, Number(userData.currency) + quantity);
  await databaseQuery(`UPDATE users SET experience = $2, currency = $3, points = $4 WHERE user_id = $1`, [user.userid || user.userId || user.user_id, exp, money, points]);
  if (quantity > 0) addServerMessage({ key: 'message', value: { userid: user.userid, message: `Você conseguiu ${quantity} Oinc(s)`, name: 'Server', type: 'server' } }, server);
  else addServerMessage({ key: 'message', value: { message: `${user.userid} deixou cair ${Math.floor(Math.abs(quantity) * 10) / 10} Oinc(s)...`, name: 'Server', type: 'server' } }, server);
  print(`[Log] ${quantity > 0 ? 'Giving' : 'Removing'} reward: ${Math.floor(quantity * 10) / 10} ${quantity > 0 ? 'to' : 'from'} ${user.userid}`);
}

async function databaseUsersGivePointsByDiscordId(discordId, quantity) {
  const account = await databaseQuery("SELECT u.user_id FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.provider = 'discord' AND a.account_id = $1", [discordId]);
  if (!account.rows[0]) return false;
  const userId = account.rows[0].user_id;
  const userData = await databaseUsersGetUser(account.rows[0]);
  if (!userData) return false;
  const points = Math.max(0, Number(userData.points) + quantity);
  const exp = Math.max(Number(userData.experience), Number(userData.experience) + quantity);
  const money = Math.max(0, Number(userData.currency) + quantity);
  const res = await databaseQuery(`UPDATE users SET experience = $2, currency = $3, points = $4 WHERE user_id = $1`, [userId, exp, money, points]);
  return res.rowCount > 0;
}

async function databaseUsersMassGivePoints(user_list, quantity, helpers = null, server = null) {
  if (!Array.isArray(user_list) || typeof quantity !== 'number') return;
  if (helpers) {
    const helperIds = helpers ? helpers.map(h => h.userid || h.userId || h.user_id) : [];
    for (const user of user_list) {
      const softbanned = validateSoftban(user.userid || user.userId || user.user_id);
      if (softbanned) {
        const list = Object.entries(getSoftbanned(user.userid || user.userId || user.user_id) || {});
        let str = '';
        for (const [id, data] of list) {
          const name = data.name || id;
          const withComma = str ? `, ${name}` : `${name}`;
          if ((str + withComma).length > 60) break;
          str += withComma;
        }
        print(`[Log] Ignoring reward from: ${user.userid}`);
        addServerMessage({ key: 'message', value: { userid: user.userid, message: `Você não pôde receber prêmios devido aos mods: ${str}`, name: 'Server', type: 'server' } }, server);
      } else {
        const isHelper = helperIds.includes(user.userid || user.userId || user.user_id);
        await databaseUsersGivePoints(user, quantity, server, isHelper);
      }
    }
  }
  const role = await getClientRole('995076647810240523');
  const top5Users = await databaseUsersGetTop('points', 0, 5);
  const top5UserIds = top5Users.map(u => u.user_id);
  for (const [_, member] of role.members) {
    const dbUser = await databaseUsersGetUserByDiscordId(member.user.id);
    if (!dbUser) {
      const hasRole = member.roles.cache.has(role.id);
      if (hasRole) await member.roles.remove(role).catch(error => print(`[Error] Application error: ${error}`));
      continue;
    }
    if (!top5UserIds.includes(dbUser.user_id)) await member.roles.remove(role).catch(error => print(`[Error] Application error: ${error}`));
  }
  for (const userId of top5UserIds) {
    const discordId = await databaseUsersGetDiscordIdByUserId({ user_id: userId });
    if (!discordId) continue;
    const member = await getClientMember(discordId);
    if (!member) continue;
    const hasRole = member.roles.cache.has(role.id);
    if (!hasRole) await member.roles.add(role).catch(error => print(`[Error] Application error: ${error}`));
  }
}

module.exports = { databaseUsersGetUser, databaseUsersGetUsers, databaseUsersGetTop, databaseUsersCreateUser, databaseUsersGiveArtifact, databaseAccountsRegisterDiscord, databaseUsersValidateDiscord, databaseUsersValidateDiscordByDiscordId, databaseUsersValidateArtifact, databaseUsersGivePoints, databaseUsersGivePointsByDiscordId, databaseUsersMassGivePoints };
