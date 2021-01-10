import {
  ServerRoute,
  ResponseToolkit,
  Lifecycle,
  RouteOptionsValidate,
  Request,
  RouteOptionsResponseSchema
} from '@hapi/hapi'
import joi from 'joi'
import Boom from '@hapi/boom'

import * as actors from '../../lib/actors'
import { isHasCode } from '../../util/types'


interface ParamsId {
  id: number
}
const validateParamsId: RouteOptionsValidate = {
  params: joi.object({
    id: joi.number().required().min(1),
  })
}

interface PayloadActor {
  name: string
  bio: string
  bornAt: Date
  filmography?:actors.ActorFilmographyInput[]
}
interface PayloadActorFilmography {
  movie: number
  actor: number
  plays: string
}

const validatePayloadActor: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string().required(),
    bio: joi.string().required(),
    bornAt: joi.date().required(),
    filmography: joi.array().items(
      joi.object({
        movie:joi.number().required().min(1),
        plays:joi.string().required()
      }))
  })
}
const validatePayloadActorFilmography: RouteOptionsResponseSchema = {
  payload: joi.object({
    actor:joi.number().required().min(1),
    movie:joi.number().required().min(1),
    plays:joi.string().required()
  })
}


const validatePayloadUpdateActor: RouteOptionsResponseSchema = {
  payload: joi.object({
    name: joi.string(),
    bio: joi.string(),
    bornAt: joi.date(),
  })
}


export const actorRoutes: ServerRoute[] = [{
  method: 'GET',
  path: '/actors',
  handler: getAll,
},{
  method: 'POST',
  path: '/actors',
  handler: post,
  options: { validate: validatePayloadActor },
},
{
  method: 'GET',
  path: '/actors/{id}',
  handler: get,
  options: { validate: validateParamsId },
},{
  method: 'PUT',
  path: '/actors/{id}',
  handler: put,
  options: { validate: {...validateParamsId, ...validatePayloadUpdateActor} },
},{
  method: 'DELETE',
  path: '/actors/{id}',
  handler: remove,
  options: { validate: validateParamsId },
},
{
  method: 'GET',
  path: '/actors/{id}/filmography',
  handler: getActorFilmography,
  options: { validate: validateParamsId },
},
{
  method: 'GET',
  path: '/actors/filmography/{id}',
  handler: getFilmography,
  options: { validate: validateParamsId },
},
{
  method: 'GET',
  path: '/actors/{id}/moviesCountByGenre',
  handler: getMoviesCountByGenre,
  options: { validate: validateParamsId },
},
{
  method: 'POST',
  path: '/actors/filmography',
  handler: addToFilmography,
  options: { validate: validatePayloadActorFilmography },
},
{
  method: 'DELETE',
  path: '/actors/filmography/{id}',
  handler: removeFilmography,
  options: { validate: validateParamsId },
},]


async function getAll(_req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  return actors.list()
}

async function get(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found = await actors.find(id)
  return found || Boom.notFound()
}

async function post(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { name,bio,bornAt,filmography} = (req.payload as PayloadActor)

  try {
    const id = await actors.create({ name,bio,bornAt,filmography })
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}


async function put(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  try {
    return await actors.update(id,  req.payload as PayloadActor ) ? h.response().code(204) : Boom.notFound()
  }
  catch(er: unknown){
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function remove(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  return await actors.remove(id) ? h.response().code(204) : Boom.notFound()
}


async function getActorFilmography(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found:{id:number;movie:string;plays:string;genre:string}[] = await actors.filmographyByActor(id)
  return found || Boom.notFound()
}
async function getFilmography(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found:{id:number;movie:number;actor:number;plays:string}[] = await actors.filmographyById(id)
  return found || Boom.notFound()
}

async function addToFilmography(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { actor,movie,plays} = (req.payload as PayloadActorFilmography)

  try {
    const id = await actors.addToFilmography({ actor,movie,plays})
    const result = {
      id,
      path: `${req.route.path}/${id}`
    }
    return h.response(result).code(201)
  }
  catch(er: unknown){
    console.log(er)
    if(!isHasCode(er) || er.code !== 'ER_DUP_ENTRY') throw er
    return Boom.conflict()
  }
}

async function removeFilmography(req: Request, h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  return await actors.removeFromFilmography(id) ? h.response().code(204) : Boom.notFound()
}


async function getMoviesCountByGenre(req: Request, _h: ResponseToolkit, _err?: Error): Promise<Lifecycle.ReturnValue> {
  const { id } = (req.params as ParamsId)

  const found:{genre:string; numMovies:number}[] = await actors.moviesCountByGenre(id)
  return found || Boom.notFound()
}
