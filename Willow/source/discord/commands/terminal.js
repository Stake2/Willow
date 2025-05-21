const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { addServerMessage } = require("../../scripts/serverlist");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("terminal").setDescription("Execute um comando no servidor.").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)).addStringOption(option => option.setName("comando").setDescription("O comando a ser executado").setRequired(true)),
    run: async ({ interaction }) => {
        const server = parseInt(interaction.options.getString("servidor")) + 1;
        const command = interaction.options.getString("comando");
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        addServerMessage({ key: "terminal", value: { message: command } }, server);
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`💻\` · **Executando comando...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
