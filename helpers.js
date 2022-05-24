const knex = require('./db.js');
const util = require("util");

function getIcon(state) {
  switch (state) {
    case 'remote':
      return ':house: Remote';
    case 'office':
      return ':office: Office';
    case 'ooo':
      return ':desert_island: Out of Office';
    default:
      return ':warning: Not selected'
  }
}

function findSelectedOption(state, name) {
  return Object.keys(state.values)
    .filter((id) => state.values[id].hasOwnProperty(name))
    .map((id) => state.values[id])[0][name].selected_option.value;
}

function findSelectedUsers(state, name) {
  return Object.keys(state.values)
    .filter((id) => state.values[id].hasOwnProperty(name))
    .map((id) => state.values[id])[0][name].selected_users;
}

function log(...msgs) {
  console.log(util.inspect(msgs, {showHidden: false, depth: null, colors: true}))
}

async function insertIfNotExist(tableName, keys, values) {
  const value = await knex(tableName)
    .where(keys)
    .first()

  if (value === undefined) {
    await knex(tableName).insert({
      ...keys,
      ...values
    })
  }
}

async function insertOrUpdate(tableName, keys, values) {
  const value = await knex(tableName)
    .where(keys)
    .first()

  if (value === undefined) {
    await knex(tableName).insert({
      ...keys,
      ...values
    })
  } else {
    await knex(tableName)
      .where(keys)
      .update(values)
  }
}

async function ensureUserExist(userId, serverId, name) {
  await insertIfNotExist(
    'users',
    {
      id: userId,
      server_id: serverId,
    },
    {
      name: name,
    }
  );
}

module.exports = {
  getIcon,
  log,
  findSelectedOption,
  findSelectedUsers,
  insertIfNotExist,
  insertOrUpdate,
  ensureUserExist,
}
