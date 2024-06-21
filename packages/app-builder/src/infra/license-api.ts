import { licenseApi } from 'marble-api';
import * as R from 'remeda';

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type LicenseApi = {
  [P in FunctionKeys<typeof licenseApi>]: (typeof licenseApi)[P];
};

function getLicenseAPIClient({ baseUrl }: { baseUrl: string }): LicenseApi {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaults, servers, ...api } = licenseApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return value(...args, { baseUrl });
  });
}
export function initializeLicenseAPIClient({ baseUrl }: { baseUrl: string }) {
  return {
    licenseAPIClient: getLicenseAPIClient({ baseUrl }),
  };
}
