const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("debug").setDescription("Hello world!"),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`🤖\` · **Debugando...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
