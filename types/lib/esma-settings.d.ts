/** @param {esma.Settings} userSettings */
export function config(userSettings: esma.Settings): void;
/** @typedef {import('./types.js').esma.Settings} esma.Settings */
/** @type {esma.Settings} */
export const settings: esma.Settings;
export namespace esma {
    type Settings = import('./types.js').esma.Settings;
}
