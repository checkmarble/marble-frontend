import { HttpError } from 'oazapfts';

const authErrors = ['NoAccount', 'Unknown'] as const;

export type AuthErrors = (typeof authErrors)[number];

export function adaptAuthErrors(error: unknown): AuthErrors {
  if (
    error instanceof HttpError &&
    error.status === 401 &&
    typeof error.data === 'string' &&
    error.data?.includes('unknown user')
  )
    return 'NoAccount';

  if (
    error instanceof HttpError &&
    error.status === 401 &&
    typeof error.data === 'string' &&
    error.data?.includes('not found')
  )
    return 'NoAccount';

  return 'Unknown';
}
