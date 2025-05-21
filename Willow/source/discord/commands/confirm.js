const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { handleConfirmation } = require("../../scripts/confirmations");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("confirm").setDescription("Confirme uma ação!"),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        const validation = handleConfirmation(interaction);
        if (!validation) return interaction.reply({ content: `-# Eu espero 1 minuto pela resposta...`, embeds: [buildEmbed({ color: 0x3B88C3, description: `\`⏹️\` · **Pode não existir nada para confirmar...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`) });
        interaction.reply({ embeds: [buildEmbed({ color: 0x77B255, description: `\`✅\` · **Interação confirmada!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`) });
    }
};
