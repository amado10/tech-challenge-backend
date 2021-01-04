import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.raw(`
    CREATE TABLE MovieActor (
      id    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      movie    INT(10) UNSIGNED NOT NULL,
      actor    INT(10) UNSIGNED NOT NULL
      character  VARCHAR(50) NOT NULL,

      CONSTRAINT PK_MovieActor__id PRIMARY KEY (id),
      CONSTRAINT FK_movie FOREIGN KEY (id) REFERENCES Movie(id)
      CONSTRAINT FK_actor FOREIGN KEY (id) REFERENCES Actor(id)
  );`)
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.raw('DROP TABLE MovieActor;')

}


