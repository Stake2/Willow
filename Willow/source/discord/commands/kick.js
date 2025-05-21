const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { addServerMessage } = require("../../scripts/serverlist");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("kick").setDescription("Expulse um jogador do servidor.").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)).addStringOption(option => option.setName("id").setDescription("O ID do usuário que quer expulsar.").setRequired(true)),
    run: async ({ interaction }) => {
        const server = parseInt(interaction.options.getString("servidor")) + 1;
        const id = interaction.options.getString("id");
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        addServerMessage({ key: "kick", value: { userid: id } }, server);
        interaction.reply({ embeds: [buildEmbed({ color: 0xFFC83D, description: `\`👋\` · **Expulsando \`${id}\`...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
