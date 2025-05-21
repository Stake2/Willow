const { databaseUsersGetUser, databaseUsersGetUsers } = require("../../database/users");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
    let user = null;
    if (body.value.arguments) user = await databaseUsersGetUser({ userid: body.value.arguments });
    else user = await databaseUsersGetUser(body.value);
    if (!user) return;
    const users = await databaseUsersGetUsers();
    const rankings = users.map(user => ({ userid: user.user_id, name: user.name?.replace(/[^a-zA-Z0-9]/g, ''), points: user.points })).sort((a, b) => b.points - a.points);
    const userIndex = rankings.findIndex(user => user.userid === (body.value.arguments ? body.value.arguments : body.value.userid));
    if (!userIndex) return;
    const userRank = userIndex !== -1 ? userIndex + 1 : null;
    const userPoints = userRank ? rankings[userIndex].points : 0;
    const description = `Nome. ${user.name} (${user.user_id})\nFortuna. ${parseFloat(user.currency).toFixed(1)} Oinc(s)\nMedalhas. 0 medalha(s)\nPontuação. ${userPoints} - ${userRank}° lugar\nRegistro. ${user.discordid || "Inexistente."}`;
    addServerMessage({ key: "message", value: { userid: body.value.userid, message: `★ Carteira de ${user.name} ★\n${description}`, name: "Server", type: "server" } }, server.identity);
}