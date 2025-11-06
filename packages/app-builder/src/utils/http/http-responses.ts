import { json } from '@remix-run/node';

import { BAD_REQUEST, CONFLICT, FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, UNAUTHORIZED } from './http-status-codes';

function errorResponse<Data>(status: number) {
  return (data: Data, init?: Omit<ResponseInit, 'status'>) => {
    throw json(data, { status, ...init });
  };
}

export const badRequest = errorResponse(BAD_REQUEST);
export const unauthorized = errorResponse(UNAUTHORIZED);
export const forbidden = errorResponse(FORBIDDEN);
export const notFound = errorResponse(NOT_FOUND);
export const conflict = errorResponse(CONFLICT);

export const internalServerError = errorResponse(INTERNAL_SERVER_ERROR);
