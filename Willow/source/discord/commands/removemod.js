const { SlashCommandBuilder } = require("discord.js");
const { databaseModsDeleteMod } = require("../../database/mods");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { print } = require("../../utils/output");
const { buildEmbed } = require("../embeds");

module.exports = {
    data: new SlashCommandBuilder().setName("removemod").setDescription("Remova um mod do banco de dados.").addStringOption(option => option.setName("id").setDescription("ID do mod").setRequired(true)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        const id = interaction.options.getString("id");
        const res = await databaseModsDeleteMod(id);
        if (res) interaction.reply({ embeds: [buildEmbed({ color: 0x5B547E, description: `\`💣\` **·Mod \`${id}\` removido!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        else interaction.reply({ embeds: [buildEmbed({ color: 0x5B547E, description: `\`🐟\` **· Mod \`${id}\` não existe!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
}