function log(string) {
    const colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        violet: '\x1b[35m'
    };
    
    const tagColors = {
        Setup: colors.green,
        Response: colors.violet,
        Error: colors.red,
        Request: colors.yellow,
        Body: colors.blue
    };

    const match = string.match(/\[(.*?)\](.*?):(.*)/);
    if (match) {
        const [, insideBrackets, beforeColon, afterColon] = match;
        const tagColor = tagColors[insideBrackets] || colors.blue;
        const formattedString = `${tagColor}[${insideBrackets}] ${colors.reset}${beforeColon.trim()}: ${colors.blue}${afterColon.trim()}${colors.reset}`;
        console.log(formattedString);
    } else {
        const tagOnlyMatch = string.match(/\[(.*?)\](.*)/);
        if (tagOnlyMatch) {
            const [, insideBrackets, restOfString] = tagOnlyMatch;
            const tagColor = tagColors[insideBrackets] || colors.blue;
            const formattedString = `${tagColor}[${insideBrackets}] ${colors.reset}${restOfString.trim()}${colors.reset}`;
            console.log(formattedString);
        } else {
            console.log(`${colors.reset}${string}${colors.reset}`);
        }
    }
}

module.exports = { log };
