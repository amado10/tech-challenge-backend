import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    ALTER TABLE movie
  ADD
    genre INT(10) UNSIGNED NOT NULL

  ;`)

  await knex.schema.raw(`
  ALTER TABLE movie
  ADD CONSTRAINT FK_genre
  FOREIGN KEY (genre) REFERENCES genre(id)
;`)
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    ALTER TABLE movie
     DROP CONSTRAINT FK_genre`)    
     
    await knex.schema.raw(`
    ALTER TABLE movie
    DROP COLUMN genre`)

}


