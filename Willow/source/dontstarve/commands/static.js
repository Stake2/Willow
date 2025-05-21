const { databaseUsersValidateArtifact } = require("../../database/users");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
    const hasArtifact = await databaseUsersValidateArtifact(body.value, "effect_static");
    if (!hasArtifact) return addServerMessage({ key: "message", value: { userid: body.value.userid, message: `Você não possui esse artefato!`, name: "Willow", type: "willow" } }, server.identity);
    addServerMessage({ key: "terminal", value: { message: `local player = nil for _, p in ipairs(AllPlayers) do if p.userid == "${body.value.userid}" then player = p break end end if player then c_select(player) player.AnimState:SetErosionParams(0, -0.125, -1.0) end` } }, server.identity);
    addServerMessage({ key: "playercontroller", value: { userid: body.value.userid, message: `Bzz Zzzzp...!`, animation: "strum", soundeffect: "wes/characters/wes/balloon_party" } }, server.identity);
}