import type { CurrentUser } from '@app-builder/models';
import { isTracfinConfigurationAvailable } from '@app-builder/services/feature-access';
import { redirect } from '@tanstack/react-router';

/**
 * Guard of the TRACFIN configuration route: without the permission the page does not exist for the
 * user, so there is no read-only fallback. The API enforces the same permission (a 403 is shown as an
 * error, never as an empty configuration).
 */
export function assertTracfinConfigurationAccess(user: CurrentUser): void {
  if (!isTracfinConfigurationAvailable(user)) throw redirect({ to: '/' });
}
