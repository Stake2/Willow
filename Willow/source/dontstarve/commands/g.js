const { getClientChannel } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { addServerMessage, getServers } = require("../../scripts/serverlist");
const dictionary = require("../../jsons/dictionary.json");

let lastMessage = '';

module.exports = (body, res, server) => {
    if (lastMessage == body.value.arguments) return;
    const servers = getServers();
    for (const sv of Object.values(servers)) {
        getClientChannel(sv.channel).then((channel) => {
            if (!channel) return;
            addServerMessage({ key: "message", value: { message: `${body.value.arguments}`, name: `${body.value.name} (SV${server.id - 1})`, type: "global" } }, sv.identity);
            channel.send({ embeds: [buildEmbed({ description: `\`📣\` **· ${body.value.name} \`${body.value.prefab == '' ? "Seleção" : dictionary[body.value.prefab] || body.value.prefab}\`** \`SV${server.id - 1}\` *▸* ${body.value.arguments}`, color: 0xF9C23C })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        });
    }
    lastMessage = body.value.arguments;
}