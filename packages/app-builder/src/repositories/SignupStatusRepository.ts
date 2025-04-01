import { type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { type SignupStatus } from '@app-builder/models/signup-status';

export interface SignupStatusRepository {
  getSignupStatus(): Promise<SignupStatus>;
}

export function makeGetSignupStatusRepository() {
  return (marbleCoreApiClient: MarbleCoreApi): SignupStatusRepository => ({
    async getSignupStatus() {
      const {
        migrations_run: migrationsRun,
        has_a_user: hasAUser,
        has_an_organization: hasAnOrganization,
      } = await marbleCoreApiClient.getSignupStatus();
      return { migrationsRun, hasAUser, hasAnOrganization };
    },
  });
}
