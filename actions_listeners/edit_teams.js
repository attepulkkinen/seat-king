const teamModal = require("../views/team_modal");
const knex = require('../db.js');

module.exports = async ({body, client, ack, logger}) => {
  await ack();
  logger.info("edit_teams", body)
  try {
    const teams = await knex('teams')
      .where('server_id', body.team.id)
      .select('*');

    await client.views.open({
      trigger_id: body.trigger_id,
      view: await teamModal(teams.map((team) => {
        return {
          name: team.name,
          id: '' + team.id,
        };
      })),
    });
  } catch (error) {
    logger.error(error);
  }
};
