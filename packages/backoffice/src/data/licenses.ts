import {
  createLicenseFn,
  getLicensesFn,
  type LicensePayload,
  type UpdateLicenseInput,
  updateLicenseFn,
} from '@bo/server-fns/licenses';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

// ------- Queries -------

export const listLicensesQueryOptions = () =>
  queryOptions({
    queryKey: ['licenses'],
    queryFn: getLicensesFn,
  });

// -------- Mutations --------

export const createLicense = () =>
  mutationOptions({
    mutationFn: (payload: LicensePayload) => createLicenseFn({ data: payload }),
    meta: {
      invalidates: () => [['licenses']],
    },
  });

export const updateLicense = () =>
  mutationOptions({
    mutationFn: (payload: UpdateLicenseInput) => updateLicenseFn({ data: payload }),
    meta: {
      invalidates: () => [['licenses']],
    },
  });
