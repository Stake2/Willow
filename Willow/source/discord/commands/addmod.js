const { SlashCommandBuilder } = require("discord.js");
const { databaseModsCreateMod } = require("../../database/mods");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { print } = require("../../utils/output");
const { buildEmbed } = require("../embeds");

module.exports = {
    data: new SlashCommandBuilder().setName("addmod").setDescription("Adicione um mod no banco de dados.").addStringOption(option => option.setName("id").setDescription("ID do mod").setRequired(true)).addBooleanOption(option => option.setName("permitido").setDescription("É permitido? True ou False").setRequired(true)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        const id = interaction.options.getString("id");
        const allowed = interaction.options.getBoolean("permitido");
        const res = await databaseModsCreateMod(id, allowed);
        if (res) interaction.reply({ embeds: [buildEmbed({ color: 0x5B547E, description: `\`🗃\` · **Mod \`${id}\` adicionado!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        else interaction.reply({ embeds: [buildEmbed({ color: 0x5B547E, description: `\`🗄\` · **Mod \`${id}\` duplicado!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
}