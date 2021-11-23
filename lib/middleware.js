export const middleware = []


export function use(mountPoint, fn) {
  middleware.push({ mount: mountPoint, fn })
}

