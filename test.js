const knex = require('./db');

(async () => {
  console.table(await knex('teams').select());
  console.table(await knex('users').select());
  console.table(await knex('deskings').select());
  console.table(await knex('memberships').select());
})();
