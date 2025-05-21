const { SlashCommandBuilder } = require("discord.js");
const { validateServer, validateStaff } = require("../../scripts/validations");
const { addServerMessage } = require("../../scripts/serverlist");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("rollback").setDescription("Volte no tempo, para quando tudo era mais simples!").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)).addNumberOption(option => option.setName("dias").setDescription("Quantos dias irão retornar?").setRequired(true)),
    run: async ({ interaction }) => {
        const server = parseInt(interaction.options.getString("servidor")) + 1;
        const days = interaction.options.getNumber("dias");
        if (!validateServer(interaction)) return;
        if (!validateStaff(interaction)) return;
        addServerMessage({ key: "rollback", value: { quantity: days } }, server);
        interaction.reply({ embeds: [buildEmbed({ color: 0xFC7753, description: `\`⏲️\` **· Voltando ${days} dias no tempo...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
