import * as Knex from 'knex'


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
  CREATE VIEW actorAppearances as SELECT actor, 
    m.name       AS movie, 
    m.synopsis   AS synopsis, 
    m.releasedat AS releasedAt, 
    ma.plays     AS plays, 
    m.runtime    AS runtime, 
    g.name       AS genre 
    
    FROM movieActor AS ma 
        inner join movie AS m 
          ON ma.movie = m.id 
        inner join genre AS g ON m.genre = g.id;`)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw('DROP VIEW actorAppearances;')

}


