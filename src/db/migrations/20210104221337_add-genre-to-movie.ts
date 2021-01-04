import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    ALTER TABLE Movie
    ADD genre INT(10) UNSIGNED NOT NULL,
    ADD CONSTRAINT FK_genre,
FOREIGN KEY (genre) REFERENCES Genre(id);
  );`)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    ALTER TABLE Movie
     DROP CONSTRAINT FK_genre,
     DROP COLUMN genre`)

}


