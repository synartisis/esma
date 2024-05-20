import type * as types from './esma.d.ts'


declare global {

  type Context = {
    settings: types.Settings
    skippedRouters: import('./handlers/router.js').RouterObject[]
    express_action: string | null
    express_result: any
  }

}

