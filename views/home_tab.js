const {Actions, Button, Divider, Header, HomeTab, Section, Image, Context, Md} = require('slack-block-builder');
const {getIcon} = require("../helpers");
const {DateTime} = require("luxon");
const knex = require('../db.js');
const _ = require("lodash");

function addDay(date) {
  date = date.plus({days: 1});

  if (date.weekday === 6) {
    date = date.plus({days: 1});
  }

  if (date.weekday === 0) {
    date = date.plus({days: 1});
  }

  return date;
}

function makeNextWeekDays() {
  let days = [];
  let stepper = DateTime.now();

  if (stepper.hour > 18) {
    stepper = addDay(stepper)
  }

  for (let i = 0; i < 5; i++) {
    days.push(stepper.toISODate());
    stepper = addDay(stepper)
  }

  return days;
}


async function makeViewArray(user_id) {
  const nextWeekDays = makeNextWeekDays();
  const userTeams = await knex('teams')
    .join('memberships', 'teams.id', 'memberships.team_id')
    .where('memberships.user_id', user_id)
    .select();

  const teamsMembers = await knex('memberships')
    .whereIn('team_id', userTeams.map((membership) => membership.id))
    .select();

  const nextWeekStatuses = await knex('deskings')
    .whereIn('user_id', teamsMembers.map((membership) => membership.user_id))
    .whereBetween('date', [nextWeekDays[0], nextWeekDays[nextWeekDays.length - 1]])
    .select();

  let view = {};

  const teamsMembersByTeam = _.groupBy(
    teamsMembers,
    (membership) => membership.team_id
  );

  for (const day of nextWeekDays) {
    view[day] = {};
    for (const team in teamsMembersByTeam) {
      if (!teamsMembersByTeam.hasOwnProperty(team)) continue;
      view[day][team] = {};
      for (const member of teamsMembersByTeam[team]) {
        let status = nextWeekStatuses.filter(status => {
          return status.user_id == member.user_id && status.date == day;
        });
        view[day][team][member.user_id] = status.length > 0 ? status[0].status : null;
      }
    }
  }

  return view;
}

module.exports = async (user_id, team_id) => {
  let tab = HomeTab()
    .blocks(
      Actions()
        .elements(
          Button()
            .text('Edit teams')
            .actionId('edit_teams'),
        ),
      Header({text: 'Your next 7 day deskings'}),
    )


  const view = await makeViewArray(user_id);

  for (const day in view) {
    const teams = view[day];
    const status = teams[Object.keys(teams)[0]][user_id];

    tab = tab.blocks(
      Divider(),
      Section().text(`*${day}*`),
      Section().text(`Current status:  ${getIcon(status)}`),
      Context().elements(
        Image()
          .imageUrl('https://api.slack.com/img/blocks/bkb_template_images/placeholder.png')
          .altText('Spacer'),
      ),
    );

    for (const teamId in teams) {
      tab = tab.blocks(
        Section().text(`*Team ${teamId}*`)
      );

      for (const userId in teams[teamId]) {
        if (userId === user_id) continue;
        tab = tab.blocks(
          Section().text(`${Md.user(userId)}: ${getIcon(teams[teamId][userId])}`)
        );
      }
    }

    tab = tab.blocks(
      Context().elements(
        Image()
          .imageUrl('https://api.slack.com/img/blocks/bkb_template_images/placeholder.png')
          .altText('Spacer'),
      ),
      Actions()
        .elements(
          Button()
            .text(getIcon('remote'))
            .actionId('set_remote')
            .value(day)
            .primary(status === 'remote'),
          Button()
            .text(getIcon('office'))
            .actionId('set_office')
            .value(day)
            .primary(status === 'office'),
          Button()
            .text(getIcon('ooo'))
            .actionId('set_ooo')
            .value(day)
            .primary(status === 'ooo'),
        ),
    )
  }

  return tab.buildToObject();
}
