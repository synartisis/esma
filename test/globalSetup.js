import { server as serverInstance } from '../test-files/server/server.js'

const port = 30100
export const url = `http://localhost:${port}`
export const server = serverInstance

export async function globalSetup() {
  server.listen(port, () => console.log(`test server is listening at ${port}`))
}


export async function globalTeardown() {
  server.close()
  console.log(`test server is closed`)
}