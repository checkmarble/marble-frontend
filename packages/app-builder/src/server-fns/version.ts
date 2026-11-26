import { getReleaseNotes } from '@app-builder/server/app-config';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

export const checkVersionUpdateFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { outdated, versions } = await getReleaseNotes(getRequest());

  return {
    needsUpdate: outdated.isOutdated,
    version: outdated.latestVersion ?? versions.apiVersion,
    releaseNotes: outdated.releaseNotes?.join('\n\n') ?? '',
    releaseUrl: outdated.latestUrl ?? '',
  };
});
