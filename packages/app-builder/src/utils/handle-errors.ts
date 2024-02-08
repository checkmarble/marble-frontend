import { json, redirect } from '@remix-run/node';
import { type ZodError, type ZodIssueOptionalMessage } from 'zod';

import { BAD_REQUEST } from './http-status-codes';
import { isRawUUIDIssue } from './schema/shortUUIDSchema';
import { fromUUID } from './short-uuid';

/**
 * Handles a ZodError that is thrown when parsing request parameters.
 *
 * If the error is due to a UUID being invalid, it will redirect to the same URL with the UUID replaced by its short form.
 * Otherwise, it will return a 400 Bad Request response.
 */
export function handleParseParamError<Input>(
  request: Request,
  error: ZodError<Input>,
) {
  const { issues } = error;
  if (issues.some(isRawUUIDIssue)) {
    const redirectURL = (issues as ZodIssueOptionalMessage[])
      .filter(isRawUUIDIssue)
      .reduce((acc, { params: { value } }) => {
        return acc.replace(value, fromUUID(value));
      }, request.url);
    return redirect(redirectURL);
  }
  return json(null, BAD_REQUEST);
}
