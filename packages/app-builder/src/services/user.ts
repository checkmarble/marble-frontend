import { filter, isTruthy, join, pipe } from 'remeda';

export function getFullName(user?: { firstName?: string; lastName?: string }) {
  return pipe([user?.firstName, user?.lastName], filter(isTruthy), join(' '));
}
