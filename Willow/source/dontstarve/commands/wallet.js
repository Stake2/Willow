const {
  databaseUsersGetUser,
  databaseUsersGetUsers,
} = require("../../database/users");
const { addServerMessage } = require("../../scripts/serverlist");

module.exports = async (body, res, server) => {
  let user = null;
  if (body.value.arguments)
    if (body.value.arguments == "") body.value.arguments = null;
  if (body.value.arguments)
    user = await databaseUsersGetUser({ userid: body.value.arguments });
  else user = await databaseUsersGetUser(body.value);
  if (!user) return;
  const users = await databaseUsersGetUsers();
  const userRank = "???";
  const userPoints = user.points;
  const description = `Nome. ${user.name} (${
    user.user_id
  })\nFortuna. ${parseFloat(user.currency).toFixed(
    1
  )} Oinc(s)\nMedalhas. 0 medalha(s)\nPontuação. ${userPoints} - ${userRank}° lugar\nRegistro. ${
    user.discordid || "Inexistente."
  }`;
  addServerMessage(
    {
      key: "message",
      value: {
        userid: body.value.userid,
        message: `★ Carteira de ${user.name} ★\n${description}`,
        name: "Server",
        type: "server",
      },
    },
    server.identity
  );
};
