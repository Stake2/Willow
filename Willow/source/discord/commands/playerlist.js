const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = {
    data: new SlashCommandBuilder().setName("playerlist").setDescription("Retorno a lista de jogadores online.").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)),
    run: async ({ interaction }) => {
        const server = parseInt(interaction.options.getString("servidor")) + 1;
        if (!validateServer(interaction)) return;
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`🪲\` · **Buscando...**` })] }).then(() => interaction.fetchReply()).then((message) => {
            const information = { channelid: interaction.channel.id, messageid: message.id };
            addServerMessage({ key: "userlist", value: { interaction: information } }, server);
        }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
