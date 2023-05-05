/**
 * This module is used to format URL friendly (=shorter) UUID
 * - fromUUID: convert UUID to be used as URL segment
 * - toUUID: convert URL segment id to UUID
 */

import { type LoaderArgs } from '@remix-run/node';
import shortUUID from 'short-uuid';
import invariant from 'tiny-invariant';

const translator = shortUUID();

export const toUUID = translator.toUUID;
export const fromUUID = translator.fromUUID;

// export const toUUID = (val: string) => val;
// export const fromUUID = (val: string) => val;

export const fromParams = (params: LoaderArgs['params'], name: string) => {
  const value = params[name];
  invariant(value, `${name} is required`);
  return toUUID(value);
};
