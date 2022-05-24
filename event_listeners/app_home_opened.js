const homeView = require('../views/home_tab')

module.exports = async ({event, client, logger}) => {
  try {
    if (event.tab !== 'home') return;

    await client.views.publish({
      user_id: event.user,
      view: await homeView(event.user, event.view.team_id),
    });
  } catch (error) {
    logger.error(error);
  }
};
