const teamModal = require("../views/team_modal");
const knex = require("../db");
const {findSelectedOption} = require("../helpers");

module.exports = async ({body, client, ack, logger}) => {
  await ack();
  logger.info("edit_teams_select_team", body)
  try {
    const teams = await knex('teams')
      .where('server_id', body.team.id)
      .select('*');

    const selectedTeamId = findSelectedOption(body.view.state, 'edit_teams_select_team');

    const currentMembersOfTeam = await knex('memberships')
      .where('team_id', selectedTeamId)
      .select('user_id');

    await client.views.update({
      view_id: body.view.id,
      hash: body.view.hash,
      view: await teamModal(
        teams.map((team) => {
        return {
          name: team.name,
          id: '' + team.id,
        };
      }),
        selectedTeamId,
        currentMembersOfTeam.map(membership => membership.user_id)
      ),
    });
  } catch (error) {
    logger.error(error);
  }
};
