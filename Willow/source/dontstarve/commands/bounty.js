const { databaseBountiesGetBounties } = require("../../database/bounties");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
    const bosses = await databaseBountiesGetBounties(server.id);
    if (!bosses) return;
    const string = `` + bosses.map((boss, index) => { const name = `${boss.name}`; return `${(index + 1) + "."} ${name.padEnd(20, '.')} ${boss.points} Oinc(s)`; }).join("\n");
    addServerMessage({ key: "message", value: { userid: body.value.userid, message: string, name: `Server`, type: "server" } }, server.identity);
}