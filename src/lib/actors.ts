import { knex } from '../util/knex'
export interface ActorFilmographyInput{
  movie:number
  plays:string
}
interface ActorCreateInput {
    name: string
    bio: string
    bornAt: Date
    filmography?:ActorFilmographyInput[]
}

export interface Actor extends ActorCreateInput {
    id: number
  }

export function list(): Promise<Actor[]> {
  return knex.from('actor').select()
}

export function find(id: number): Promise<Actor> {
  return knex.from('actor').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('actor').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(input: ActorCreateInput): Promise<number> {
  const {bio,bornAt,name} = input
  // Using trx as a query builder:
  return await knex.transaction(async trx => {

    const [ id ] = await (trx.into('actor').insert({bio,bornAt,name}))
    if(input.filmography !== undefined){
      const filmographyRecords:(ActorFilmographyInput & {actor:number})[] = []
      input.filmography.map((v)=> {filmographyRecords.push({...v, actor:id})})
      await trx.into('movieActor').insert(filmographyRecords)
    }
    return id

  })

}

/** @returns whether the ID was actually found */
export async function update(id: number, input: Partial<ActorCreateInput>): Promise<boolean>  {
  const count = await knex.from('actor').where({ id }).update({ input })
  return count > 0
}

export function filmography(id: number): Promise<{movie:number;plays:string;genre:string}[]> {
  return knex.from('actorAppearances').where({ actor:id }).select(['movie','plays','genre'])
}

/** @returns the ID that was created */
export async function addToFilmography(input: ActorFilmographyInput & {actor:number}): Promise<number> {
  const {actor,movie,plays} = input
  const [ id ] = await (knex.into('movieActor').insert({actor,movie,plays}))
  return id
}

/** @returns whether the ID was actually found */
export async function removeFromFilmography(id: number): Promise<boolean> {
  const count = await knex.from('movieActor').where({ id }).delete()
  return count > 0
}

export async function moviesCountByGenre(id: number): Promise<{genre:string; numMovies:number}[]> {
  /** I Know that maybe this is not optimal, but couldnt solve problem using "count(genre)" inside knex.select()
   * Unknown column 'COUNT(genre)' in 'field list'
   * So I did as a raw query so you understand the idea
  */
  const rawQuery = `SELECT genre, count(genre) as numMovies FROM actorAppearances WHERE actor=${id} GROUP BY actor,genre ORDER BY numMovies DESC`
  const [res] = await knex.raw(rawQuery) as {genre:string; numMovies:number}[][]
  return res
}
