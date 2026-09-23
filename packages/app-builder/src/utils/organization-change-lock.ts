const ORGANIZATION_CHANGE_LOCK_NAME = 'marble:organization-change';

export async function withOrganizationChangeLock<T>(callback: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request(ORGANIZATION_CHANGE_LOCK_NAME, callback);
  }

  return callback();
}
