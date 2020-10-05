import { Plugin } from '@hapi/hapi'
import { health } from './health'
import { genre } from './genre'

export const plugins: Plugin<any>[] = [
  health,
  genre,
]
