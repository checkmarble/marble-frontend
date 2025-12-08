import { createServerFn } from '@app-builder/core/requests';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';

export type VersionUpdateResource = {
  needsUpdate: boolean;
  version: string;
  releaseNotes: string;
  releaseUrl: string;
};

export const loader = createServerFn(
  [handleRedirectMiddleware, servicesMiddleware],
  async function checkUpdate({ context }) {
    const { outdated, versions } = context.appConfig;

    return {
      needsUpdate: outdated.isOutdated,
      version: outdated.latestVersion ?? versions.apiVersion,
      releaseNotes: outdated.releaseNotes?.join('\n\n') ?? '',
      releaseUrl: outdated.latestUrl ?? '',
    } satisfies VersionUpdateResource;
  },
);
