const { getSoftbanned } = require("../../scripts/softban");

module.exports = async (body, res, server) => {
  const list = getSoftbanned(body.value.userid || body.value.userId || body.value.user_id) || [];
  console.log(list);
};
