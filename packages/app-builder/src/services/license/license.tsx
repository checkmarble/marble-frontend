import { type LicenseEntitlements } from '@app-builder/models/license';
import { createSimpleContext } from '@app-builder/utils/create-context';

const LicenseContext =
  createSimpleContext<LicenseEntitlements>('LicenseContext');

export const LicenseContextProvider = LicenseContext.Provider;

export const useLicenseContext = LicenseContext.useValue;
