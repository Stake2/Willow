const { setClientGuild } = require("../../../discord");
const { setupApplication } = require("../../../scripts/clientready");
const { setupMods } = require("../../../scripts/modlist");
const { startRoutines } = require("../../../scripts/routines");
const { setupServers, addServerMessage } = require("../../../scripts/serverlist");
const { print } = require("../../../utils/output");

module.exports = async (client) => {
    print(`[Setup] Discord client connected: ${client.user.username}`);
    await setClientGuild();
    await setupMods();
    await setupServers();
    setupApplication();
    startRoutines();
    //addServerMessage({ key: "terminal", value: [] }, "RS2LTS");
    //addServerMessage({ key: [], value: [] }, "RS2LTS");
}