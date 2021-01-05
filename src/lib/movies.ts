import { knex } from '../util/knex'


interface MovieCreateInput {
    name: string
    synopsis?: string
    releasedAt: Date
    runtime: number // minutes
    genre: number
}

export interface Movie extends MovieCreateInput {
    id: number
  }

export function list(): Promise<Movie[]> {
  return knex.from('movie').select()
}

export function find(id: number): Promise<Movie> {
  return knex.from('movie').where({ id }).first()
}

/** @returns whether the ID was actually found */
export async function remove(id: number): Promise<boolean> {
  const count = await knex.from('movie').where({ id }).delete()
  return count > 0
}

/** @returns the ID that was created */
export async function create(input: MovieCreateInput): Promise<number> {
  const [ id ] = await (knex.into('movie').insert(input))
  return id
}

/** @returns whether the ID was actually found */
export async function update(id: number, input: Partial<MovieCreateInput>): Promise<boolean>  {
  const count = await knex.from('movie').where({ id }).update({ input })
  return count > 0
}
