import { redirect } from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import { completeOrganizationCreation } from './complete-organization-creation';

const ORG_ID = 'ef30d8d2-5a79-4794-8853-c10ab6cc2f64';

describe('completeOrganizationCreation', () => {
  it('returns the organization when the environment update succeeds', async () => {
    const updateEnvironment = vi.fn(async () => undefined);
    const restrictFeatures = vi.fn(async () => undefined);

    await expect(
      completeOrganizationCreation({
        orgId: ORG_ID,
        environment: 'staging',
        updateEnvironment,
        restrictFeatures,
      }),
    ).resolves.toEqual({ orgId: ORG_ID, environmentUpdated: true });

    expect(updateEnvironment).toHaveBeenCalledWith(ORG_ID, 'staging');
    expect(restrictFeatures).toHaveBeenCalledWith(ORG_ID);
  });

  it('reports a failed environment update and still restricts features', async () => {
    const calls: string[] = [];

    await expect(
      completeOrganizationCreation({
        orgId: ORG_ID,
        environment: 'production',
        updateEnvironment: async () => {
          calls.push('update');
          throw new Error('environment update failed');
        },
        restrictFeatures: async () => {
          calls.push('features');
        },
      }),
    ).resolves.toEqual({ orgId: ORG_ID, environmentUpdated: false });

    expect(calls).toEqual(['update', 'features']);
  });

  it('still attempts feature restrictions when they fail after the environment update', async () => {
    const calls: string[] = [];

    await expect(
      completeOrganizationCreation({
        orgId: ORG_ID,
        environment: 'production',
        updateEnvironment: async () => {
          calls.push('update');
          throw new Error('environment update failed');
        },
        restrictFeatures: async () => {
          calls.push('features');
          throw new Error('features failed');
        },
      }),
    ).rejects.toThrow('features failed');

    expect(calls).toEqual(['update', 'features']);
  });

  it('rethrows an auth redirect before restricting features', async () => {
    const restrictFeatures = vi.fn(async () => undefined);
    const redirection = redirect({ to: '/sign-in' });

    await expect(
      completeOrganizationCreation({
        orgId: ORG_ID,
        environment: 'staging',
        updateEnvironment: async () => {
          throw redirection;
        },
        restrictFeatures,
      }),
    ).rejects.toBe(redirection);

    expect(restrictFeatures).not.toHaveBeenCalled();
  });

  it('skips the environment update when the import spec has none', async () => {
    const updateEnvironment = vi.fn(async () => undefined);

    await expect(
      completeOrganizationCreation({
        orgId: ORG_ID,
        environment: undefined,
        updateEnvironment,
      }),
    ).resolves.toEqual({ orgId: ORG_ID, environmentUpdated: true });

    expect(updateEnvironment).not.toHaveBeenCalled();
  });
});
