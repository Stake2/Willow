const { databaseUsersGivePointsByDiscordId } = require("../../../database/users");
const { getClientStatus } = require("../../../discord");
const { minigameStats } = require("../../../scripts/fruitycounter");
const { rollDice, isNumeric } = require("../../../utils/extras");
const { print } = require("../../../utils/output");
const { buildEmbed } = require("../../embeds");
require("dotenv").config();

async function prizePlayer(message) {
    const dice = rollDice(0, 20);
    if (dice != 0) return;
    const quantity = rollDice(1, 2);
    const res = await databaseUsersGivePointsByDiscordId(message.author.id, quantity);
    if (!res) return message.reply({ embeds: [buildEmbed({ description: `\`💼\` **· ${message.author} não tem uma carteira!**`, color: 0xDD2E44 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    message.reply({ embeds: [buildEmbed({ description: `\`🍉\` **· ${message.author} encontrou ${quantity} Oinc(s)!**`, color: 0x5C913B })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    message.react("⭐").catch((error) => { print(`[Error] Application error: ${error}`); });
}

async function killPlayer(message) {
    minigameStats.lives--;
    if (minigameStats.lives <= 0) {
        minigameStats.disqualified = {};
        minigameStats.lastUserId = null;
        minigameStats.counter = 1;
        minigameStats.lives = minigameStats.maxLives;
        await message.reply({ embeds: [buildEmbed({ description: "\`👻\` **· Vidas insuficientes! Reiniciando...**", color: 0xF7F7F7 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    } else {
        minigameStats.lastUserId = message.author;
        await message.reply({ embeds: [buildEmbed({ description: `\`💔\` **· Desqualificado! 0${minigameStats.lives} vidas restantes...**`, color: 0xF92F60 })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
        message.react("👻").catch((error) => { print(`[Error] Application error: ${error}`); });
        minigameStats.disqualified[message.author.id] = true;
    }
}

async function reactMessage(message, isBot) {
    let dice = rollDice(0, 12);
    let icon = '';
    switch (dice) {
        case 0: icon = "🫐"; minigameStats.counter += 2; break;
        case 1: icon = "🍌"; minigameStats.counter--; break;
        case 2: icon = "🍋‍🟩"; break;
    }
    if (minigameStats.counter > 50) {
        switch (dice) {
            case 3: icon = "🍓"; minigameStats.counter += (minigameStats.counter % 2 === 0) ? 1 : 2; break;
            case 4: icon = "🥦"; minigameStats.counter = Math.ceil((minigameStats.counter + 1) / 3) * 3; break;
            case 5: icon = "🍇"; minigameStats.counter += 3; break;
            case 6: icon = "🥕"; minigameStats.counter -= 2; break;
        }
    }
    if (icon == '') {
        icon = "🍎";
        minigameStats.counter++;
    }
    message.react(icon).catch((error) => { print(`[Error] Application error: ${error}`); });
    if (isBot) return;
    if (minigameStats.counter > 50) prizePlayer(message).catch((error) => { print(`[Error] Application error: ${error}`); });
    minigameStats.lastUserId = message.author.id;
    minigameStats.lastMessageId = message.id;
}

module.exports = async (message) => {
    if (!getClientStatus()) return;
    if (!message.guild) return;
    if (message.channel.id != process.env.DISCORD_CHANNEL_COUNTER) return;
    if (message.author.bot) return;
    if (!isNumeric(message.content)) return;
    if (minigameStats.disqualified[message.author.id]) return message.react("💔").catch((error) => { print(`[Error] Application error: ${error}`); });
    if (minigameStats.lastUserId == message.author.id) return message.react("🍋‍🟩").catch((error) => { print(`[Error] Application error: ${error}`); });
    if (message.content != minigameStats.counter) return killPlayer(message);
    reactMessage(message, false).catch((error) => { print(`[Error] Application error: ${error}`); });
    let dice = rollDice(0, 10);
    if (dice != 0) return;
    const modifier = rollDice(0, 1);
    dice = rollDice(0, 3);
    if (dice != 0) return;
    const reply = await message.channel.send(modifier == 0 ? minigameStats.counter + dice + "" : minigameStats.counter - dice + "").catch((error) => { print(`[Error] Application error: ${error}`); });
    reactMessage(reply, true).catch((error) => { print(`[Error] Application error: ${error}`); });
}