const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const claimRoles = require("../../jsons/claimroles.json");
const { buildEmbed } = require("../../discord/embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("abandon").setDescription("Livre-se de um cargo.").addRoleOption(option => option.setName("cargo").setDescription("O cargo que deseja remover.").setRequired(true)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!interaction.guild) return;
        const role = interaction.options.getRole("cargo");
        const roleId = role.id;
        const allClaimableRoles = [...(claimRoles.special || []), ...(claimRoles.default || [])];
        if (!allClaimableRoles.includes(roleId)) return interaction.reply({ embeds: [buildEmbed({ description: "\`🐾\` **· Na verdade, esse cargo não está disponível...**", color: 0x635994 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        const member = interaction.member;
        if (!member.roles.cache.has(roleId)) return interaction.reply({ embeds: [buildEmbed({ description: "\`🦨\` **· Você não tem esse cargo!**", color: 0x636363 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        await member.roles.remove(roleId).catch((error) => { print(`[Error] Application error: ${error}`); });
        return interaction.reply({ embeds: [buildEmbed({ description: "`🪹` **· Cargo removido com sucesso!**", color: 0xF3AD61 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
