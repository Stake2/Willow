const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const claimRoles = require("../../jsons/claimroles.json");
const { buildEmbed } = require("../../discord/embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("reclaim").setDescription("Resgate um cargo.").addRoleOption(option => option.setName("cargo").setDescription("O cargo que deseja resgatar!").setRequired(true)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        if (!interaction.guild) return;
        const role = interaction.options.getRole("cargo");
        const roleId = role.id;
        const member = interaction.member;
        const allClaimableRoles = [...(claimRoles.special || []), ...(claimRoles.default || [])];
        if (!allClaimableRoles.includes(roleId)) return interaction.reply({ embeds: [buildEmbed({ description: "\`🐾\` **· Na verdade, esse cargo não está disponível...**", color: 0x635994 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        const hasVip = (claimRoles.vip || []).some(vipRoleId => member.roles.cache.has(vipRoleId));
        const isSpecial = (claimRoles.special || []).includes(roleId);
        if (!hasVip && isSpecial) return interaction.reply({ embeds: [buildEmbed({ description: "\`🪳\`** · Você não é um membro privilegiado.**", color: 0xA56953 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        if (isSpecial) {
            const alreadyHasSpecial = (claimRoles.special || []).some(id => member.roles.cache.has(id));
            if (alreadyHasSpecial) return interaction.reply({ embeds: [buildEmbed({ description: "\`🐵\` **· Você já possui um cargo especial.**", color: 0xE39D89 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        }
        if (member.roles.cache.has(roleId)) return interaction.reply({ embeds: [buildEmbed({ description: "\`🐵\` **· Você já tem esse cargo!**", color: 0xE39D89 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        await member.roles.add(roleId).catch((error) => { print(`[Error] Application error: ${error}`); });
        return interaction.reply({ embeds: [buildEmbed({ description: "\`🪅\` **· Cargo resgatado com sucesso!**", color: 0xFF6DC6 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
