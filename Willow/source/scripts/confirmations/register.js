const { databaseAccountsRegisterDiscord } = require("../../database/users");
const { getClientMember } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { print } = require("../../utils/output");

module.exports = async (data) => {
    const success = await databaseAccountsRegisterDiscord({ user_id: data.user_id }, data.discord_id);
    if (!success) {
        data.member.send({ embeds: [buildEmbed({ description: `🗃️ · **Houve um erro na interação!**` })] }).catch(error => print(`[Error] Application error: ${error}`));
        return;
    }
    const roleToRemove = "1352767411480166520";
    const roleToAdd = "1352767722064318514";
    try {
        const member = await getClientMember(data.discord_id);
        if (!member) return;
        if (member.roles.cache.has(roleToRemove)) await member.roles.remove(roleToRemove);
        await member.roles.add(roleToAdd);
    } catch (error) {
        print(`[Error] Application error: ${error}`);
    }
};
