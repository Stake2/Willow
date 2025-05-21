const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { addServerMessage } = require("../../scripts/serverlist");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("ban").setDescription("Bane um jogador do servidor.").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)).addStringOption(option => option.setName("id").setDescription("O ID do usuário que quer banir.").setRequired(true)).addNumberOption(option => option.setName("dias").setDescription("Quantos dias irá durar o banimento.").setRequired(false)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        const serverId = parseInt(interaction.options.getString("servidor")) + 1;
        const userId = interaction.options.getString("id");
        let duration = interaction.options.getNumber("dias");
        if (!duration) duration = 90;
        addServerMessage({ key: "ban", value: { userid: userId, duration: duration * 3600 * 24 } }, serverId);
        interaction.reply({ embeds: [buildEmbed({ color: 0x62417F, description: `\`🫂\` · **Banindo \`${userId}\` por \`${duration}\` dias...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
