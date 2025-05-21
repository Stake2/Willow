const maxLives = 5;

let minigameStats = {
    counter: 1,
    maxLives: maxLives,
    lives: maxLives,
    lastUserId: null,
    lastMessageId: null,
    disqualified: {},
}

module.exports = { minigameStats }