import { DataReturnType, ExitFunction } from '@app-builder/core/middleware-types';
import { createMiddleware } from '@app-builder/core/requests';

const isRedirectResponse = (response: Response) => {
  return (
    response.status >= 300 && response.status < 400 && response.headers.get('Location') !== null
  );
};
const handleResult = <T extends DataReturnType<any, any> | Response>(
  value: T,
  exit: ExitFunction,
) => {
  const res = value instanceof Response ? value : value.data;
  if (res instanceof Response && isRedirectResponse(res)) {
    const loc = res.headers.get('Location')!;
    return exit({ redirectTo: loc });
  }
  return value;
};

export const handleRedirectMiddleware = createMiddleware(
  [],
  async function handleRedirectMiddleware(_, next, exit) {
    try {
      return handleResult(await next(), exit);
    } catch (error) {
      if (error instanceof Response) {
        const res = handleResult(error, exit);
        if (res instanceof Response) throw res;
        return res;
      }
      throw error;
    }
  },
);
