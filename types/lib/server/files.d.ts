/** @param {string} root */
export function createParametricIndex(root: string): Promise<void>;
/** @param {string} url */
export function getParametricFile(url: string): {
    dynFile: {
        dir: string;
        name: string;
        param: string;
        reValue: RegExp;
    };
    value: string;
} | undefined;
/** @param {esma.File} file */
export function setFile(file: esma.File): void;
/** @param {string} fileUrl */
export function getFile(fileUrl: string): import("../types.js").esma.File | undefined;
/** @type {esma.File[]} */
export const fileIndex: esma.File[];
/** @type {{ dir: string, name: string, param: string, reValue: RegExp }[]} */
export const parametricFileIndex: {
    dir: string;
    name: string;
    param: string;
    reValue: RegExp;
}[];
export namespace esma {
    type File = import('../types.js').esma.File;
}
