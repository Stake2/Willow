const { getClientMember } = require("../../discord");
const { buildEmbed } = require("../../discord/embeds");
const { createConfirmation } = require("../../scripts/confirmations");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
    const param = body.value.arguments;
    if (!param) return addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Você precisa informar o Discord ID!`, name: "Willow", type: "willow" } }, server.identity);
    if (param.length < 16 && param.length > 19) return addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Seu Discord ID não existe.`, name: "Willow", type: "willow" } }, server.identity);
    const member = await getClientMember(param);
    if (!member) return addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Usuário Discord não encontrado.`, name: "Willow", type: "willow" } }, server.identity);
    member.send({ embeds: [buildEmbed({ description: `\`🚧\` · **Você é ${body.value.name} \`${body.value.userid}\`? \`/confirm\` ou \`/cancel\`...**`, color: 0xFFCC4D })] }).catch((error) => { print(`[Error] Application error: ${error}`); });
    createConfirmation(body.value.userid, member, "register");
}