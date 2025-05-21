const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { print } = require("../../utils/output");
const { buildEmbed } = require("../embeds");

module.exports = {
    data: new SlashCommandBuilder().setName("mydiscordid").setDescription("Descubra seu ID do Discord!"),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        interaction.reply({ embeds: [buildEmbed({ color: 0x744EAA, description: `\`📑\` · **Hey, o seu ID é \`${interaction.user.id}\`!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
