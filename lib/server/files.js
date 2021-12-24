/** @type {esma.File[]} */
export const fileIndex = []
// const enabled = process.env.NODE_ENV === 'production'


export function setFile(/**@type {esma.File}*/file) {
  // if (!enabled) return
  const entry = getFile(file.url)
  if (entry) {
    Object.assign(entry, file)
  } else {
    fileIndex.push(file)
  }
}


export function getFile(fileUrl) {
  let file = fileIndex.find(o => o.url === fileUrl)
  return file
}

