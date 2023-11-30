import * as R from 'remeda';

export function getFullName(user?: { firstName?: string; lastName?: string }) {
  return R.pipe(
    [user?.firstName, user?.lastName],
    R.filter(R.isTruthy),
    R.join(' ')
  );
}
