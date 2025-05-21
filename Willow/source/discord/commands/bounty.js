const { SlashCommandBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { getServer } = require("../../scripts/serverlist");
const { databaseBountiesGetBounties } = require("../../database/bounties");
const { buildEmbed } = require("../embeds");
const { print } = require("../../utils/output");

module.exports = {
    data: new SlashCommandBuilder().setName("bounty").setDescription("Retorno a lista de recompensas.").addStringOption(option => option.setName("servidor").setDescription("O servidor alvo").setRequired(true)),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        const serverId = parseInt(interaction.options.getString("servidor")) + 1;
        const server = getServer(serverId);
        if (!server) return;
        const bosses = await databaseBountiesGetBounties(server.id);
        let formattedBosses = null;
        if (!bosses || typeof bosses !== "object") print("[Error] Invalid value: Bounties");
        else { formattedBosses = Object.values(bosses).map((boss, index) => `\`${String(index + 1).padStart(2, "0")}.\` ${boss.name} \`${boss.points} Oinc(s)\``).join("\n"); }
        interaction.reply({ embeds: [buildEmbed({ color: 0x990042, title: `\`👹\` · Recompensas de: \`${server.identity}\``, description: formattedBosses })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    }
};
