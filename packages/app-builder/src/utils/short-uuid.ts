/**
 * This module is used to format URL friendly (=shorter) UUID
 * - fromUUIDtoSUUID: convert UUID to be used as URL segment
 * - fromSUUIDtoUUID: convert URL segment id to UUID
 */

import { useParams } from '@tanstack/react-router';
import { createTranslator } from 'short-uuid';
import { type UUID } from 'short-uuid/src/types';
import invariant from 'tiny-invariant';

const translator = createTranslator();

export const fromSUUIDtoUUID = (val: string) => translator.toUUID(val);
export const fromUUIDtoSUUID = (val: string) => translator.fromUUID(val);

export const fromParams = (params: Record<string, string | undefined>, name: string): UUID => {
  const value = params[name];
  invariant(value, `${name} is required`);
  return fromSUUIDtoUUID(value);
};

export const useParam = (name: string) => {
  const params = useParams({ strict: false });
  return fromParams(params, name);
};
