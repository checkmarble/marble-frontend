import { type CurrentUser } from '@app-builder/models';
import { useLocation, useMatches } from '@remix-run/react';
import { useEffect } from 'react';
import { useHydrated } from 'remix-utils';

import getPageViewNameAndProps from './getPageviewNameAndProps';

export function useSegmentIdentification(user: CurrentUser) {
  const isHydrated = useHydrated();
  useEffect(() => {
    if (isHydrated) {
      void window.analytics.identify(user.actorIdentity.userId);
      if (user.actorIdentity.userId) {
        void window.analytics.track('Logged In');
      }
    }
  }, [user.actorIdentity.userId, user.organizationId, isHydrated]);
}

export function useSegmentPageTracking() {
  const location = useLocation();
  const isHydrated = useHydrated();
  const matches = useMatches();
  const thisPage = matches[matches.length - 1];
  useEffect(() => {
    if (isHydrated) {
      const tracking = getPageViewNameAndProps(thisPage);
      if (!tracking) return;
      const { name, properties } = tracking;
      void window.analytics.page(name, properties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, thisPage.id, isHydrated]);

  return null;
}

export const segment = {
  reset: () => window.analytics.reset(),
};
