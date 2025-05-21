const { databaseQuery } = require("../postgre");
const { addServerMessage } = require("../scripts/serverlist");
const { validateSoftban, getSoftbanned } = require("../scripts/softban");
const { print } = require("../utils/output");

const allowedKeys = ["points", "experience", "currency"];

async function databaseUsersGetUser(user) {
    let res = await databaseQuery(`SELECT * FROM users WHERE user_id = $1`, [user.userid || user.userId || user.user_id]);
    if (res.rows.length === 0) {
        await databaseUsersCreateUser(user);
        res = await databaseQuery(`SELECT * FROM users WHERE user_id = $1`, [user.userid || user.userId || user.user_id]);
    }
    return res.rows[0];
}

async function databaseUsersGetUsers() {
    const res = await databaseQuery("SELECT * FROM users");
    return res.rows;
}

async function databaseUsersGetTop(key, start, end) {
    if (!allowedKeys.includes(key)) return;
    const res = await databaseQuery(`SELECT * FROM users ORDER BY ${key} DESC LIMIT $1 OFFSET $2`, [end - start, start]);
    return res.rows;
}

async function databaseUsersCreateUser(user) {
    if (!user.name) return null;
    const result = await databaseQuery(`INSERT INTO users (user_id, name, points, experience, currency) VALUES ($1, $2, 0, 0, 0) ON CONFLICT (user_id) DO NOTHING;`, [user.userid, user.name.length > 16 ? user.name.slice(0, 16) : user.name]);
    const rowCount = result.rowCount > 0;
    if (rowCount) print(`[Log] User was registered: ${user.name}`);
    return rowCount;
}

async function databaseUsersGiveArtifact(user, artifactName) {
    const artifactRes = await databaseQuery("SELECT id FROM artifacts WHERE name = $1", [artifactName]);
    if (artifactRes.rows.length === 0) return false;
    const artifactId = artifactRes.rows[0].id;
    const userRes = await databaseQuery("SELECT id FROM users WHERE user_id = $1", [user.userid || user.userId || user.user_id]);
    if (userRes.rows.length === 0) return false;
    const userId = userRes.rows[0].id;
    await databaseQuery("INSERT INTO earned_artifacts (user_id, artifact_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, artifactId]);
    return true;
}

async function databaseAccountsRegisterDiscord(user, discordId) {
    const userRes = await databaseQuery("SELECT id FROM users WHERE user_id = $1", [user.userid || user.userId || user.user_id]);
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
    const res = await databaseQuery(
        "SELECT EXISTS (SELECT 1 FROM accounts WHERE provider = 'discord' AND account_id = $1) AS has_discord",
        [discordId]
    );
    return res.rows[0]?.has_discord || false;
}

async function databaseUsersValidateArtifact(user, artifactName) {
    const res = await databaseQuery("SELECT EXISTS (SELECT 1 FROM users u JOIN earned_artifacts ea ON ea.user_id = u.id JOIN artifacts a ON a.id = ea.artifact_id WHERE u.user_id = $1 AND a.name = $2) AS has_artifact", [user.userid || user.userId || user.user_id, artifactName]);
    return res.rows[0]?.has_artifact || false;
}

async function databaseUsersGivePoints(user, value, server = null, isHelper = false) {
    let quantity = value;
    let userData = await databaseUsersGetUser(user);
    if (!userData) return;
    if (quantity > 0) {
        switch (user.prefab) {
            case "wes": quantity *= 2; break;
            case "wonkey": quantity *= 1.6; break;
            case "wilson": quantity *= 1.4; break;
            case "warly": quantity *= 1.2; break;
            case "wormwood": quantity *= 1.1; break;
            case "wx78": quantity *= 1.1; break;
            case "wanda": quantity *= 0.9; break;
            case "wurt": quantity *= 0.8; break;
            case "winona": quantity *= 0.8; break;
            case "wolfgang": quantity *= 0.8; break;
            case "waxwell": quantity *= 0.7; break;
            case "wortox": quantity *= 0.7; break;
        }
        if (!isHelper) quantity *= 0.2;
        quantity = Math.floor(quantity * 10) / 10;
    }
    const points = Math.max(0, Number(userData.points) + quantity);
    const exp = Math.max(Number(userData.experience), Number(userData.experience) + quantity);
    const money = Math.max(0, Number(userData.currency) + quantity);
    await databaseQuery(`UPDATE users SET experience = $2, currency = $3, points = $4 WHERE user_id = $1`, [user.userid || user.userId || user.user_id, exp, money, points]);
    if (quantity > 0) addServerMessage({ key: "message", value: { userid: user.userid, message: `Você conseguiu ${quantity} Oinc(s)`, name: "Server", type: "server" } }, server);
    else addServerMessage({ key: "message", value: { message: `${user.userid} deixou cair ${Math.floor(Math.abs(quantity) * 10) / 10} Oinc(s)...`, name: "Server", type: "server" } }, server);
    print(`[Success] Giving ${Math.floor(quantity * 10) / 10} points to ${user.userid}`);
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
    if (!Array.isArray(user_list) || typeof quantity !== "number") return;
    if (helpers) {
        const helperIds = helpers ? helpers.map(h => h.userid || h.userId || h.user_id) : [];
        for (const user of user_list) {
            const softbanned = validateSoftban(user.userid || user.userId || user.user_id);
            if (softbanned) {
                const list = getSoftbanned(user.userid || user.userId || user.user_id) || [];
                let str = "";
                for (const value of list) {
                    const withComma = str ? `, ${value}` : `${value}`;
                    if ((str + withComma).length > 60) break;
                    str += withComma;
                }
                addServerMessage({ key: "message", value: { userid: user.userid, message: `Você não pode receber prêmios devido aos mods: ${str}`, name: "Server", type: "server" } }, server);
            } else {
                const isHelper = helperIds.includes(user.userid || user.userId || user.user_id);
                await databaseUsersGivePoints(user, quantity, server, isHelper);
            }
        }
        return;
    }
    const helperIds = helpers ? helpers.map(h => h.userid || h.userId || h.user_id) : [];
    for (const user of user_list) {
        const isHelper = helperIds.includes(user.userid || user.userId || user.user_id);
        const reward = isHelper ? quantity : quantity * 0.2;
        await databaseUsersGivePoints(user, reward, server, isHelper);
    }
}


module.exports = { databaseUsersGetUser, databaseUsersGetUsers, databaseUsersGetTop, databaseUsersCreateUser, databaseUsersGiveArtifact, databaseAccountsRegisterDiscord, databaseUsersValidateDiscord, databaseUsersValidateDiscordByDiscordId, databaseUsersValidateArtifact, databaseUsersGivePoints, databaseUsersGivePointsByDiscordId, databaseUsersMassGivePoints };