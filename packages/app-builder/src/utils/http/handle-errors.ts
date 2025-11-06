import { redirect } from '@remix-run/node';
import { type ZodError } from 'zod/v4';

import { isRawUUIDIssue } from '../schema/shortUUIDSchema';
import { fromUUIDtoSUUID } from '../short-uuid';
import { badRequest } from './http-responses';

/**
 * Handles a ZodError that is thrown when parsing request parameters.
 *
 * If the error is due to a UUID being invalid, it will redirect to the same URL with the UUID replaced by its short form.
 * Otherwise, it will return a 400 Bad Request response.
 */
export function handleParseParamError<Input>(request: Request, error: ZodError<Input>) {
  const { issues } = error;
  if (issues.some(isRawUUIDIssue)) {
    const redirectURL = (issues as unknown[]).filter(isRawUUIDIssue).reduce((acc, { params: { value } }) => {
      return acc.replace(value, fromUUIDtoSUUID(value));
    }, request.url);
    return redirect(redirectURL);
  }
  return badRequest(error.issues);
}
