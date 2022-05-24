/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('memberships', (table) => {
    table.integer('team_id').unsigned();
    table.foreign('team_id').references('id').inTable('teams');

    table.string('user_id', 15);
    table.foreign('user_id').references('id').inTable('users');

    table.unique(['team_id', 'user_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('memberships');
};
