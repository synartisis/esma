import * as utils from './test-utils.js'

export const mochaHooks = {

  afterAll() {
    const server = utils.getServer()
    server.close()
  },

}
