/**
 * This module is used to format URL friendly (=shorter) UUID
 * - fromUUID: convert UUID to be used as URL segment
 * - toUUID: convert URL segment id to UUID
 */

import shortUUID from 'short-uuid';

const translator = shortUUID();

export const toUUID = translator.toUUID;
export const fromUUID = translator.fromUUID;

// export const toUUID = (val: string) => val;
// export const fromUUID = (val: string) => val;
