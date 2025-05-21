const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`🏓\` · **Pong!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
