function rollDice(min, max) {
    if (typeof min !== "number" || typeof max !== "number") return 0;
    if (min >= max) return 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
}

module.exports = { rollDice, isNumeric }