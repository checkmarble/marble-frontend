import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';

export type CreateInitialOrgArgs = {
  organization: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Left out on OIDC instances, where the identity provider owns credentials. */
  password?: string;
};

export interface OnboardingRepository {
  createInitialOrg(args: CreateInitialOrgArgs): Promise<void>;
}

export function makeGetOnboardingRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): OnboardingRepository => ({
    async createInitialOrg({ organization, email, firstName, lastName, password }) {
      await marbleCoreApiClient.createInitialOrg({
        organization,
        email,
        firstname: firstName,
        lastname: lastName,
        password,
      });
    },
  });
}
