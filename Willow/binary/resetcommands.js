const { REST, Routes } = require('discord.js');
const { print } = require('../source/utils/output');
require("dotenv").config();

const rest = new REST().setToken(process.env.DISCORD_CLIENT_TOKEN);

async function resetCommands() {
    print("[Log] Starting: Resetting commands");
    try {
        await rest.put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [] });
        print("[Log] Global commands reset");
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID), { body: [] });
        print("[Log] Guild commands reset");
    } catch (error) {
        print(`[Error] Application error: ${error}`);
    } finally {
        print("[Log] Finished: Resetting commands");
        process.exit(0);
    }
}

resetCommands();
