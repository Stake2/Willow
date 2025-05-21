const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { addServerMessage } = require("../../scripts/serverlist");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("regenerate").setDescription("Faça que um servidor regenere o cluster!").addStringOption(option => option.setName("server").setDescription("O servidor alvo").setRequired(true)),
    run: async ({ interaction }) => {
        const server = parseInt(interaction.options.getString("server")) + 1;
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        addServerMessage({ key: "regenerate" }, server);
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`🪐\` **· Regenerando o mundo...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
