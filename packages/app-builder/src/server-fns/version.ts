import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { createServerFn } from '@tanstack/react-start';

export const checkVersionUpdateFn = createServerFn({ method: 'GET' })
  .middleware([servicesMiddleware])
  .handler(async ({ context }) => {
    const { outdated, versions } = await context.services.appConfigRepository.getReleaseNotes();

    return {
      needsUpdate: outdated.isOutdated,
      version: outdated.latestVersion ?? versions.apiVersion,
      releaseNotes: outdated.releaseNotes?.join('\n\n') ?? '',
      releaseUrl: outdated.latestUrl ?? '',
    };
  });
