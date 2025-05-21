const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { validateServer } = require("../../scripts/validations");
const { databaseUsersGetTop } = require("../../database/users");

const medals = { 0: "🥇", 1: "🥈", 2: "🥉" };

module.exports = {
    data: new SlashCommandBuilder().setName("top").setDescription("Analise o leaderboard do server."),
    run: async ({ interaction }) => {
        if (!validateServer(interaction)) return;
        const start = 0;
        const end = 10;
        const [top_currency, top_points] = await Promise.all([databaseUsersGetTop("currency", start, end), databaseUsersGetTop("points", start, end)]);
        const has_any_data = top_currency.length || top_points.length;
        if (!has_any_data) { return interaction.reply({ content: "\`📛\` **· Não há dados suficientes para exibir o ranking!**", ephemeral: true, }); }
        const formatRank = (list, type, lineLength = 25) => {
            return list.map((user, index) => {
                const medal = medals[index] ?? "👤";
                const value = String(user[type] ?? 0);
                const name_max_len = lineLength - medal.length - value.length - 2;
                let name = user.name ?? "Alguém";
                if (name.length > name_max_len) name = name.slice(0, name_max_len);
                const dots_count = Math.max(0, lineLength - (medal.length + name.length + value.length + 2));
                let dots = '';
                for (let i = 0; i < dots_count; i++) {
                    dots += i % 2 === 0 ? "·" : " ";
                }
                return `\`${medal} ${name} ${dots} ${value}\`\n`;
            }).join("");
        };
        const embed = new EmbedBuilder().addFields([{ name: "**\`🪅\` Rank por Pontuação         **\`▾\`", value: formatRank(top_points, "points") || "Vazio!", inline: true, }, { name: "**\`💷\` Rank por Prosperidade    **\`▾\`", value: formatRank(top_currency, "currency") || "Vazio!", inline: true, },]).setColor(0x393A41);
        const banner = new EmbedBuilder().setImage("https://media.discordapp.net/attachments/1270552171041263658/1356303937829081158/image.png").setColor(0x393A41);
        interaction.reply({ embeds: [banner, embed] }).catch(() => { });
    },
};
