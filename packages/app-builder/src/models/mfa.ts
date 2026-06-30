import { type MultiFactorInfo } from 'firebase/auth';

export interface MfaFactor {
  uid: string;
  displayName: string | null;
  factorId: string;
  enrollmentTime: string;
}

export function adaptMfaFactor(info: MultiFactorInfo): MfaFactor {
  return {
    uid: info.uid,
    displayName: info.displayName ?? null,
    factorId: info.factorId,
    enrollmentTime: info.enrollmentTime,
  };
}
