import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE TABLE movieActor (
      id    INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
      plays VARCHAR(50),
      movie    INT(10) UNSIGNED NOT NULL,
      actor    INT(10) UNSIGNED NOT NULL,
      CONSTRAINT PK_movieActor__id PRIMARY KEY (id),
      CONSTRAINT FK_movie FOREIGN KEY (id) REFERENCES movie(id),
      CONSTRAINT FK_actor FOREIGN KEY (id) REFERENCES actor(id)
  );`)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP TABLE movieActor;')

}


