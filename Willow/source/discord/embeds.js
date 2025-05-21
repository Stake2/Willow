const { EmbedBuilder } = require("discord.js");
const { print } = require("../utils/output");

function buildEmbed({ author = null, title = null, description = null, thumbnail = null, url = null, image = null, footer = null, timestamp = null, fields = [], color = 0x2b2d31 }) {
    const embed = new EmbedBuilder();
    embed.setColor(color);
    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (author) embed.setAuthor({ name: author.name, url: author.url, icon: author.icon });
    if (footer) embed.setFooter({ text: footer.text, icon: footer.icon });
    if (url) embed.setURL(url);
    if (image) embed.setImage(image);
    if (timestamp) embed.setTimestamp(timestamp);
    if (Array.isArray(fields) && fields.length > 0) fields.forEach(field => { if (field.name && field.value) { embed.addFields({ name: field.name, value: field.value, inline: field.inline || false, }); } });
    return embed;
}

function embedError(interaction) {
    interaction.reply({ embeds: [buildEmbed({ description: `🗃️ · **Houve um erro na interação!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
}

function embedNoPermission(interaction) {
    interaction.reply({ embeds: [buildEmbed({ description: `🚸 · **Permissão negada!**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
}

function embedBusy(interaction) {
    interaction.reply({ embeds: [buildEmbed({ description: `🤹‍♂️ · **No momento estou ocupada...**` })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
}

module.exports = { buildEmbed, embedNoPermission, embedError, embedBusy };