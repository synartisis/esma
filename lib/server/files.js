import * as fs from 'node:fs/promises'
import * as path from 'node:path'

/** @typedef {import('../types.js').esma.File} esma.File */

let reParametricFilePattern = '__(?<param>[a-zA-Z_]+)__'

/** @type {esma.File[]} */
export const fileIndex = []
/** @type {{ dir: string, name: string, param: string, reValue: RegExp }[]} */
export const parametricFileIndex = []


/** @param {string} root */
export async function createParametricIndex(root) {
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


/** @param {string} url */
export function getParametricFile(url) {
  const { dir, name } = path.parse(url)
  for (const dynFile of parametricFileIndex) {
    if (dir !== dynFile.dir) continue
    const { value } = dynFile.reValue.exec(name)?.groups ?? {}
    if (value) {
      return { dynFile, value }
    }
  }
}


/** @param {esma.File} file */
export function setFile(file) {
  const entry = getFile(file.url)
  if (entry) {
    Object.assign(entry, file)
  } else {
    fileIndex.push(file)
  }
}


/** @param {string} fileUrl */
export function getFile(fileUrl) {
  let file = fileIndex.find(o => o.url === fileUrl)
  return file
}


/** @type {(dir: string, predicate?: (fname: string) => boolean) => Promise<string[]>} */
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