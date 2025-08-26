import { ActionFunction, ActionFunctionArgs } from '@remix-run/node';

export const makeAgnosticAction = (actionFn: ActionFunction) => {
  const isRedirectResponse = (response: Response) => {
    return (
      response.status >= 300 && response.status < 400 && response.headers.get('Location') !== null
    );
  };
  const hasHandledRedirect = (value: unknown) => {
    return value instanceof Object && value !== null && 'redirectTo' in value;
  };
  const handleActionResult = (value: unknown) => {
    if (value instanceof Response && isRedirectResponse(value)) {
      const location = value.headers.get('Location')!;
      return { redirectTo: location };
    }
    return value;
  };

  return async (args: ActionFunctionArgs) => {
    try {
      return handleActionResult(await actionFn(args));
    } catch (error) {
      const result = handleActionResult(error);
      if (hasHandledRedirect(result)) {
        return result;
      }
      throw error;
    }
  };
};
