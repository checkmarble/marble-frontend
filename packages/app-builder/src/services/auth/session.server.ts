import {
  type CookieParseOptions,
  type CookieSerializeOptions,
  type Session,
  type SessionData,
  type SessionStorage,
} from '@remix-run/node';

export type SessionService<Data = SessionData, FlashData = Data> = {
  getSession: (
    request: Request,
    options?: CookieParseOptions,
  ) => Promise<Session<Data, FlashData>>;
  commitSession: (
    session: Session<Data, FlashData>,
    options?: CookieSerializeOptions,
  ) => Promise<string>;
  destroySession: (
    session: Session<Data, FlashData>,
    options?: CookieSerializeOptions,
  ) => Promise<string>;
};

export function makeSessionService<Data = SessionData, FlashData = Data>(
  sessionStorage: SessionStorage<Data, FlashData>,
): SessionService<Data, FlashData> {
  return {
    getSession: (request, options) =>
      sessionStorage.getSession(request.headers.get('cookie'), options),
    commitSession: sessionStorage.commitSession,
    destroySession: sessionStorage.destroySession,
  };
}
