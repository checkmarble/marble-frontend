import { type SessionStorageRepository } from '@app-builder/repositories/SessionStorageRepository';

export function makeSessionService({
  sessionStorage,
}: SessionStorageRepository) {
  return {
    getSession: (request: Request) =>
      sessionStorage.getSession(request.headers.get('cookie')),
    commitSession: sessionStorage.commitSession,
    destroySession: sessionStorage.destroySession,
  };
}

export type SessionService = ReturnType<typeof makeSessionService>;
