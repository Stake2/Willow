const { setupDiscord } = require("./source/discord");
const { startExpress } = require("./source/express");
const { print } = require("./source/utils/output");

async function main() {
    console.clear();
    print("[Setup] Starting: Core systems");
    await setupDiscord();
    startExpress();
}

main();