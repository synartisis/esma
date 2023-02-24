import fs from 'node:fs/promises'
import path from 'node:path'

let reParametricFilePattern = '__(?<param>[a-zA-Z_]+)__'

/** @type {esma.File[]} */
export const fileIndex = []
/** @type {{ dir: string, name: string, param: string, reValue: RegExp }[]} */
export const parametricFileIndex = []


export async function createParametricIndex(/** @type {string} */root) {
  const reParametricFile = new RegExp(reParametricFilePattern)
  for await (const pFile of await getFiles(root)) {
    const { dir, name } = path.parse(pFile)
    const { param } = reParametricFile.exec(pFile)?.groups ?? {}
    if (param) {
      const reValue = new RegExp(name.replace(`__${param}__`, '(?<value>.+)'))
      parametricFileIndex.push({ dir, name: pFile, param, reValue })
    }
  }
}


export function getParametricFile(/** @type {string} */url) {
  const { dir, name } = path.parse(url)
  for (const dynFile of parametricFileIndex) {
    if (dir !== dynFile.dir) continue
    const { value } = dynFile.reValue.exec(name)?.groups ?? {}
    if (value) {
      return { dynFile, value }
    }
  }
}


export function setFile(/**@type {esma.File}*/file) {
  const entry = getFile(file.url)
  if (entry) {
    Object.assign(entry, file)
  } else {
    fileIndex.push(file)
  }
}


export function getFile(/** @type {string} */fileUrl) {
  let file = fileIndex.find(o => o.url === fileUrl)
  return file
}


/** @type {(dir: string, predicate?: (fname: string) => boolean) => Promise<any>} */
async function getFiles(dir, predicate = () => true) {
  const result = []
  const dirents = await fs.readdir(dir, { withFileTypes: true }) 
  for (const dirent of dirents) {
    const name = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      result.push(... await getFiles(name, predicate))
    } else {
      if (predicate(name)) result.push(name)
    }
  }
  return result
}