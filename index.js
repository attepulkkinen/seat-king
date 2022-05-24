"use strict";

const {App, LogLevel } = require('@slack/bolt');
const {log} = require("./helpers");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
  logLevel: LogLevel.INFO,
  logger: {
    debug: log,
    info: log,
    warn: log,
    error: log,
    setLevel: (level) => {
    },
    getLevel: () => {
    },
    setName: (name) => {
    },
  },
});

app.event('app_home_opened', require('./event_listeners/app_home_opened'));

app.action(/^set_(remote|office|ooo)$/, require('./actions_listeners/set_status'));

app.action('edit_teams', require('./actions_listeners/edit_teams'));
app.action('edit_teams_select_team', require('./actions_listeners/edit_teams_select_team'));
app.view('edit_teams_submit', require('./actions_listeners/edit_teams_submit'));

(async () => {
  await app.start();
  log('⚡️ Bolt app is running!');
})();
