/**
 * This module is used to format URL friendly (=shorter) UUID
 * - fromUUID: convert UUID to be used as URL segment
 * - toUUID: convert URL segment id to UUID
 */

import { type LoaderFunctionArgs } from '@remix-run/node';
import { useParams } from '@remix-run/react';
import shortUUID from 'short-uuid';
import invariant from 'tiny-invariant';

const translator = shortUUID();

export const toUUID = (val: string) => translator.toUUID(val);
export const fromUUID = (val: string) => translator.fromUUID(val);

export const fromParams = (params: LoaderFunctionArgs['params'], name: string) => {
  const value = params[name];
  invariant(value, `${name} is required`);
  if (!translator.validate(value)) {
    return value;
  }
  return fromUUID(value);
};

export const useParam = (name: string) => {
  const params = useParams();
  return fromParams(params, name);
};
