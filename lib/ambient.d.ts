import type * as types from './esma.d.ts'


declare global {

  type Context = {
    settings: types.Settings
    express_action: string | null
    express_result: any
  }

}

