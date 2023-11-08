import { type User } from '@app-builder/models';
import { useLocation, useMatches } from '@remix-run/react';
import { useEffect } from 'react';
import { useHydrated } from 'remix-utils';

import getPageViewNameAndProps from './getPageviewNameAndProps';

export function useSegmentIdentification(user: User) {
  const isHydrated = useHydrated();
  useEffect(() => {
    if (isHydrated) {
      window.analytics.identify(user.actorIdentity.userId);
      if (user.actorIdentity.userId) {
        window.analytics.track('Logged In');
      }
    }
  }, [user.actorIdentity.userId, user.organizationId, isHydrated]);
}

export function SegmentScript({ writeKey }: { writeKey: string }) {
  const location = useLocation();
  const isHydrated = useHydrated();
  const matches = useMatches();
  const thisPage = matches[matches.length - 1];
  useEffect(() => {
    if (isHydrated) {
      const tracking = getPageViewNameAndProps(thisPage);
      if (!tracking) return;
      const { name, properties } = tracking;
      window.analytics.page(name, properties);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, thisPage.id, isHydrated]);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){if(window.analytics.initialized)return window.analytics[e].apply(window.analytics,arguments);var i=Array.prototype.slice.call(arguments);i.unshift(e);analytics.push(i);return analytics}};for(var i=0;i<analytics.methods.length;i++){var key=analytics.methods[i];analytics[key]=analytics.factory(key)}analytics.load=function(key,i){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=i};analytics._writeKey="${writeKey}";;analytics.SNIPPET_VERSION="4.16.1";
        analytics.load("${writeKey}");
        }}();`,
      }}
    />
  );
}
