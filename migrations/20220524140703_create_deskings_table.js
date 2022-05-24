/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('deskings', (table) => {
        table.string('server_id', 15);
        table.string('user_id', 15);
        table.datetime('date');
        table.string('status');

        table.unique(['user_id', 'server_id', 'date']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('deskings');
}

