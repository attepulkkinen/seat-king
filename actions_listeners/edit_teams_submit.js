const {findSelectedOption, findSelectedUsers} = require("../helpers");
const knex = require("../db");

module.exports = async ({body, view, ack, logger}) => {
  await ack();
  logger.info("edit_teams_submit", body)
  try {
    const selectedTeamId = findSelectedOption(view.state, 'edit_teams_select_team');
    const selectedMembers = findSelectedUsers(view.state, 'edit_teams_select_members');

    const currentMembers = (await knex('memberships')
      .where('team_id', selectedTeamId)
      .select('user_id'))
      .map((membership) => membership.user_id);

    const membersToBeAdded = selectedMembers.filter(x => !currentMembers.includes(x));
    const membersToBeRemoved = currentMembers.filter(x => !selectedMembers.includes(x));

    if(membersToBeAdded.length > 0) {
      await knex('memberships')
        .insert(membersToBeAdded.map((user) => ({ team_id: selectedTeamId, user_id: user })));
    }

    if(membersToBeRemoved.length > 0) {
      await knex('memberships')
        .where('team_id', selectedTeamId)
        .whereIn('user_id', membersToBeRemoved)
        .del();
    }

  } catch (error) {
    logger.error(error);
  }
};
