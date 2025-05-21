const { databaseUsersGetTop } = require("../../database/users");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
    const pageNumber = body.arguments ? parseInt(body.arguments) : 1;
    const currentPage = Math.max(pageNumber, 1);
    const start = (currentPage - 1) * 5;
    const end = start + 5;
    const users = await databaseUsersGetTop("points", start, end);
    if (!users || users.length === 0) return addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Ranking vazio!`, name: "Willow", type: "willow" } }, server.identity);
    const maxnameLength = Math.max(...users.map(u => (u.name?.length || 0)), 30);
    const top5 = users.map((user, index) => {
        const name = (user.name || "Desconhecido").replace(/[^a-zA-Z0-9]/g, '');
        const rank = start + index + 1;
        const points = parseFloat(user.points).toFixed(1);
        const paddedName = name.padEnd(maxnameLength, '.');
        const paddedPoints = points < 10 ? ` 0${points}` : `${points}`;
        return `${rank}. ${paddedName}${paddedPoints}XP`;
    }).join("\n");
    addServerMessage({ key: "message", value: { message: `★ Ranking dos Sobreviventes: Página 0${currentPage} ★\n${top5}`, name: "Server", type: "server" } }, server.identity);
}