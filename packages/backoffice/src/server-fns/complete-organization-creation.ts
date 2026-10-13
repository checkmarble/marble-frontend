import { isRedirect } from '@tanstack/react-router';

export type CreatedOrganizationResult = {
  orgId: string;
  environmentUpdated: boolean;
};

const isCreatableEnvironment = (environment: string | undefined): environment is 'production' | 'staging' =>
  environment === 'production' || environment === 'staging';

export const completeOrganizationCreation = async ({
  orgId,
  environment,
  updateEnvironment,
  restrictFeatures,
}: {
  orgId: string;
  environment?: string;
  updateEnvironment: (orgId: string, environment: 'production' | 'staging') => Promise<unknown>;
  restrictFeatures?: (orgId: string) => Promise<unknown>;
}): Promise<CreatedOrganizationResult> => {
  let environmentUpdated = true;

  if (isCreatableEnvironment(environment)) {
    try {
      await updateEnvironment(orgId, environment);
    } catch (error) {
      if (isRedirect(error)) throw error;
      environmentUpdated = false;
    }
  }

  await restrictFeatures?.(orgId);

  return { orgId, environmentUpdated };
};
