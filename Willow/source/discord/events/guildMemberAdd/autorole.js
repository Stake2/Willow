const { databaseUsersValidateDiscordByDiscordId } = require("../../../database/users");
const { print } = require("../../../utils/output");

const roleRegistered = "1352767722064318514";
const roleUnregistered = "1352767411480166520";

module.exports = async (member) => {
    try {
        const hasDiscordLinked = await databaseUsersValidateDiscordByDiscordId(member.id);
        if (hasDiscordLinked) {
            if (member.roles.cache.has(roleUnregistered)) await member.roles.remove(roleUnregistered);
            if (!member.roles.cache.has(roleRegistered)) await member.roles.add(roleRegistered);
        } else if (!member.roles.cache.has(roleUnregistered)) await member.roles.add(roleUnregistered);
    } catch (error) {
        print(`[Error] Application error: ${error}`);
    }
};
