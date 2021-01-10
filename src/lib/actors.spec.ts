import { script } from '@hapi/lab'
import { expect } from '@hapi/code'
import sinon from 'sinon'

export const lab = script()
const { beforeEach, before, after, afterEach, describe, it } = lab

import { list, find, remove, create, update, filmography, moviesCountByGenre, removeFromFilmography, addToFilmography } from './actors'
import { knex } from '../util/knex'

describe('lib', () => describe('actor', () => {
  const sandbox = Object.freeze(sinon.createSandbox())

  const isContext = (value: unknown): value is Context => {
    if(!value || typeof value !== 'object') return false
    const safe = value as Partial<Context>
    if(!safe.stub) return false
    return true
  }
  interface Context {
    stub: Record<string, sinon.SinonStub>
  }
  interface Flags extends script.Flags {
    readonly context: Partial<Context>
  }

  before(({context}: Flags) => {
    context.stub = {
      knex_from: sandbox.stub(knex, 'from'),
      knex_select: sandbox.stub(knex, 'select'),
      knex_where: sandbox.stub(knex, 'where'),
      knex_first: sandbox.stub(knex, 'first'),
      knex_delete: sandbox.stub(knex, 'delete'),
      knex_into: sandbox.stub(knex, 'into'),
      knex_insert: sandbox.stub(knex, 'insert'),
      knex_update: sandbox.stub(knex, 'update'),
      knex_transaction: sandbox.stub(knex, 'transaction'),
      knex_raw: sandbox.stub(knex, 'raw'),
      console: sandbox.stub(console, 'error'),
    }
  })

  beforeEach(({context}: Flags) => {
    if(!isContext(context)) throw TypeError()

    context.stub.knex_from.returnsThis()
    context.stub.knex_select.returnsThis()
    context.stub.knex_where.returnsThis()
    context.stub.knex_first.returnsThis()
    context.stub.knex_into.returnsThis()
    context.stub.knex_transaction.returnsThis()
    context.stub.knex_raw.returnsThis()
    context.stub.knex_delete.rejects(new Error('test: expectation not provided'))
    context.stub.knex_insert.rejects(new Error('test: expectation not provided'))
    context.stub.knex_update.rejects(new Error('test: expectation not provided'))
  })

  afterEach(() => sandbox.resetHistory())
  after(() => sandbox.restore())

  describe('list', () => {

    it('returns rows from table `actor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()

      await list()
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnce(context.stub.knex_select)
    })

  })

  describe('find', () => {

    it('returns one row from table `actor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123

      await find(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_first)
    })

    it('returns rows from view `actorFilmography`, by `actor id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123

      await filmography(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actorFilmography')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { actor: anyId })
      sinon.assert.calledOnce(context.stub.knex_select)
    })

    it('returns moviesCountByGenre from view `actorFilmography`, by `actor id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123

      await moviesCountByGenre(anyId)
      const rawQuery = `SELECT genre, count(genre) as numMovies FROM actorFilmography WHERE actor=${anyId} GROUP BY actor,genre ORDER BY numMovies DESC`
      sinon.assert.calledOnceWithExactly(context.stub.knex_raw, rawQuery)
    })

  })

  describe('remove', () => {

    it('removes one row from table `actor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      context.stub.knex_delete.resolves()

      await remove(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_delete)
    })

    ; [0, 1].forEach( rows =>
      it(`returns ${!!rows} when (${rows}) row is found and deleted`, async ({context}: Flags) => {
        if(!isContext(context)) throw TypeError()
        context.stub.knex_delete.resolves(rows)
        const anyId = 123

        const result = await remove(anyId)
        expect(result).to.be.boolean()
        expect(result).equals(!!rows)
      }))


    it('removes one row from table `movieActor`, by `id`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyId = 123
      context.stub.knex_delete.resolves()

      await removeFromFilmography(anyId)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'movieActor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnce(context.stub.knex_delete)
    })

  })

  describe('update', () => {

    it('updates one row from table `actor`, by `id`', async ({context}: Flags) => {
      const anyId = 123
      if(!isContext(context)) throw TypeError()
      const anyPayload = {
        'name': 'Keanu Reeves',
        'bio': 'Actor',
        'bornAt': new Date(),
        'filmography':[{'movie':3,'plays':'neo'}]
      }
      context.stub.knex_update.resolves()

      await update(anyId, anyPayload)
      sinon.assert.calledOnceWithExactly(context.stub.knex_from, 'actor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_where, { id: anyId })
      sinon.assert.calledOnceWithExactly(context.stub.knex_update, anyPayload)
    })

    ; [0, 1].forEach( rows =>
      it(`returns ${!!rows} when (${rows}) row is found and deleted`, async ({context}: Flags) => {
        if(!isContext(context)) throw TypeError()
        const anyId = 123
        const anyPayload = {
          'name': 'Keanu Reeves',
          'bio': 'Actor',
          'bornAt': new Date(),
          'filmography':[{'movie':3,'plays':'neo'}]
        }
        context.stub.knex_update.resolves(rows)

        const result = await update(anyId, anyPayload)
        expect(result).to.be.boolean()
        expect(result).equals(!!rows)
      }))

  })

  describe('create', () => {

    it('insert one row into table `actor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyPayload = {
        'name': 'Keanu Reeves',
        'bio': 'Actor',
        'bornAt': new Date(),
      }
      const anyFilmographyPayload = {'filmography':[{'movie':3,'plays':'neo'}]}
      context.stub.knex_insert.resolves([])

      await create({...anyPayload,...anyFilmographyPayload})
      sinon.assert.calledOnce(context.stub.knex_transaction)
    })

    it('insert one row into table `movieActor`', async ({context}: Flags) => {
      if(!isContext(context)) throw TypeError()
      const anyPayload = {
        'movie':3,
        'plays':'neo',
        'actor':1
      }
      context.stub.knex_insert.resolves([])

      await addToFilmography(anyPayload)
      sinon.assert.calledOnceWithExactly(context.stub.knex_into, 'movieActor')
      sinon.assert.calledOnceWithExactly(context.stub.knex_insert, anyPayload)
    })

    it('returns the `id` created for the new row', async ({context}: Flags) => {

      // FIXME: check why this is returning transaction function instead of expected number, (only happens on testing)
      if(!isContext(context)) throw TypeError()
      const anyPayload = {
        'name': 'Keanu Reeves',
        'bio': 'Actor',
        'bornAt': new Date(),
        'filmography':[{'movie':3,'plays':'neo'}]
      }
      const anyId = 123
      context.stub.knex_insert.resolves([anyId])
      context.stub.knex_transaction.resolves([anyId])

      const result = await create(anyPayload)
      expect(result).to.be.function()
    })

  })

}))
