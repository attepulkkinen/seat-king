const homeView = require("../views/home_tab");
const {insertOrUpdate, ensureUserExist} = require("../helpers");

module.exports = async ({body, client, ack, logger}) => {
  await ack();
  try {
    await ensureUserExist(body.user.id, body.user.team_id, body.user.name);

    await insertOrUpdate(
      'deskings',
      {
        user_id: body.user.id,
        server_id: body.user.team_id,
        date: body.actions[0].value,
      },
      {
        status: body.actions[0].action_id.replace('set_', '')
      }
    );

    await client.views.publish({
      user_id: body.user.id,
      view: await homeView(body.user.id, body.user.team_id),
    });
  } catch (error) {
    logger.error(error);
  }
};
