const tags = {
    '[Setup]': "\x1b[34m",
    '[Log]': "\x1b[36m",
    '[Request]': "\x1b[35m",
    '[Success]': "\x1b[32m",
    '[Error]': "\x1b[31m",
    '[Warn]': "\x1b[33m"
};

const blocks = {
    '[Setup]': "\x1b[44m",
    '[Log]': "\x1b[46m",
    '[Request]': "\x1b[45m",
    '[Success]': "\x1b[42m",
    '[Error]': "\x1b[41m",
    '[Warn]': "\x1b[43m"
};

const specials = {
    'value': "\x1b[2m",
    'reset': "\x1b[0m",
};

function print(string) {
    let formattedString = "";
    for (const word of string.split(" ")) {
        if (tags[`${word}`]) formattedString += `${blocks[word]}  ${specials.reset} ${tags[word]}${word}${specials.reset} `;
        else if (word.endsWith(":")) formattedString += `${word}${specials.value} `
        else formattedString += `${word} `;
    }
    console.log(formattedString);
}

function printMajorError(error) {
    print(`[Error] ${error}`);
    print(`[Error] Application ended: Major error`);
    process.exit(1);
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

module.exports = { print, capitalizeFirstLetter, printMajorError };