const { getClientChannel } = require("../../discord");
const { getServer, addServerMessage } = require("../../scripts/serverlist");
const { rollDice } = require("../../utils/extras");
const dictionary = require("../../jsons/dictionary.json");
const { print } = require("../../utils/output");
const { databaseUsersGetUser, databaseUsersGivePoints } = require("../../database/users");

module.exports = (body, res) => {
    const serverId = body.serverid || body.serverId
    const server = getServer(serverId);
    if (!server) return;
    const channel = server.channel;
    getClientChannel(channel).then(async (channel) => {
        if (!channel) return;
        if (!body.value.userid) return;
        let target = "Charlie";
        let players = Object.values(body.value.players) || null;
        let playersLength = players.length || 0;
        if (playersLength > 0) {
            players = players.filter(player => player.userid !== body.value.userid);
            if (players.length > 1) {
                const dice = rollDice(0, players.length - 1)
                target = players[dice].name || "Charlie";
            }
        } else return;
        const doerName = dictionary[body.value.doer] || body.value.doer || "Desconhecido";
        const desc = `- Queda causada por **${doerName}**\n- Será que **${target}** vai ajudar?\n- Assombrações te **corroem**.`;
        const title = `\`👻\` · ${body.value.victim.slice(0, 12)} está morto(a)!`;
        channel.send({ embeds: [{ color: 0x8C8C8C, title: title, description: desc, thumbnail: { url: "https://media.discordapp.net/attachments/1270552171041263658/1343494255632580628/image.png?ex=67bd7a07&is=67bc2887&hm=b2d9146a8000778e700214957e225db667886bf11142c1d5b5e4c918b1d512b5&=&format=webp&quality=lossless" } }] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        const player = await databaseUsersGetUser({ userid: body.value.userid });
        if (!player) return;
        const luck = rollDice(1, 10);
        let quantity = player.experience * (0.01 * luck);
        if (quantity == 0) return;
        databaseUsersGivePoints(body.value, -quantity, serverId);
    });
}