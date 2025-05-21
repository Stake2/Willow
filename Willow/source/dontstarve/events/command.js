const fs = require('fs');
const path = require('path');
const { getClientChannel } = require('../../discord');
const { buildEmbed } = require('../../discord/embeds');
const { print } = require('../../utils/output');
const { getServer } = require('../../scripts/serverlist');
const dictionary = require("../../jsons/dictionary.json");

const commandHandlers = {};
const commandHandlersDir = path.join(__dirname, '../commands');

fs.readdirSync(commandHandlersDir).forEach(file => {
    if (file.endsWith('.js')) {
        const key = path.basename(file, '.js');
        commandHandlers[key] = require(path.join(commandHandlersDir, file));
    }
});

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId
    const server = getServer(serverId);
    if (!server) return;
    const handler = commandHandlers[body.value.command];
    if (handler) handler(body, res, server);
    return;
    getClientChannel(server.channel).then((channel) => {
        if (!channel) return;
        channel.send({ embeds: [buildEmbed({ description: `\`💻\` *·* **${body.value.name} \`${body.value.prefab == '' ? "Seleção" : dictionary[body.value.prefab] || body.value.prefab}\`** *▸* ${body.value.command}`, color: 0xC2C2C2 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    })
}