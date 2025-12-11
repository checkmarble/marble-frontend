import { COOKIE_NAME } from '@app-builder/utils/preferences-cookies/config';
import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-write';
import Cookie from 'js-cookie';
import { useEffect } from 'react';

function getStoredTimezone(): string | undefined {
  try {
    const raw = Cookie.get(COOKIE_NAME);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.timezone;
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

/**
 * Component that detects the user's timezone and stores it in preferences cookie.
 *
 * On first visit (no timezone stored), it sets the cookie and reloads the page so the
 * server can use the correct timezone for date formatting, avoiding hydration mismatches.
 *
 * On subsequent visits, it only updates the cookie if the timezone has changed
 * (e.g., user traveled to a different timezone) without reloading.
 */
export function TimezoneDetector() {
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const storedTimezone = getStoredTimezone();
    console.log('detectedTimezone', detectedTimezone);
    console.log('storedTimezone', storedTimezone);
    if (detectedTimezone && detectedTimezone !== storedTimezone) {
      setPreferencesCookie('timezone', detectedTimezone);

      // Reload only on first detection to apply the timezone server-side
      if (!storedTimezone) {
        window.location.reload();
      }
    }
  }, []);

  return null;
}
