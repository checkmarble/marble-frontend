export const backendGlobalErrors = ['disallowed-network'] as const;

export type BackendGlobalErrorCode = (typeof backendGlobalErrors)[number];

export const isBackendGlobalError = (code: string): code is BackendGlobalErrorCode => {
  return backendGlobalErrors.includes(code as BackendGlobalErrorCode);
};

export class BackendGlobalError extends Error {
  code: BackendGlobalErrorCode | 'unknown';

  constructor(code: BackendGlobalError['code'], message: string = '') {
    super(message);
    this.code = code;
  }
}

function forwardHeader(currentHeaders: Headers, newHeaders: Headers, name: string, defaultValue?: string) {
  const headerValue = currentHeaders.get(name) ?? defaultValue;
  if (headerValue !== null && headerValue !== undefined) {
    newHeaders.set(name, headerValue);
  }
}

export type BasicFetchParams = { request: Request };

export function createBasicFetch({ request }: BasicFetchParams) {
  return async function basicFetch(input: RequestInfo | URL, init?: RequestInit) {
    const headers = new Headers(init?.headers);

    headers.set('x-referer-app', 'marble-frontend');

    // forwarding trace headers
    forwardHeader(request.headers, headers, 'traceparent');
    forwardHeader(request.headers, headers, 'X-Cloud-Trace-Context');
    forwardHeader(
      request.headers,
      headers,
      'x-real-ip',
      process.env['NODE_ENV'] === 'development' ? process.env['CUSTOM_X_REAL_IP'] : undefined,
    );

    return fetch(input, { ...init, headers }).then(handleBackendGlobalError);
  };
}

export function handleBackendGlobalError(response: Response) {
  const globalErrorHeader = response.headers.get('x-marble-global-error');

  if (globalErrorHeader) {
    const errorCode = isBackendGlobalError(globalErrorHeader) ? globalErrorHeader : 'unknown';
    throw new BackendGlobalError(errorCode);
  }

  return response;
}
