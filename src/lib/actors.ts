import { knex } from '../util/knex'

interface ActorCreateInput {
    name: string
    bio: string
    bornAt: Date
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
  const [ id ] = await (knex.into('actor').insert(input))
  return id
}

/** @returns whether the ID was actually found */
export async function update(id: number, input: Partial<ActorCreateInput>): Promise<boolean>  {
  const count = await knex.from('actor').where({ id }).update({ input })
  return count > 0
}
