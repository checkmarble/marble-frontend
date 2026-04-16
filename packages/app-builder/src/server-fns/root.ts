import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { registerSSRInstance } from '@app-builder/services/i18n/i18n-instance-store';
import { getLocale, makeI18nextServerInstance } from '@app-builder/services/i18n/i18next.server';
import { getSegmentScript } from '@app-builder/services/segment/segment.server';
import { getToast } from '@app-builder/services/toast.server';
import { commitCsrfToken } from '@app-builder/utils/csrf.server';
import { getClientEnvVars, getServerEnv } from '@app-builder/utils/environment';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { createContentSecurityPolicy } from '@mcansh/http-helmet';
import { createServerFn } from '@tanstack/react-start';
import { getRequest, setResponseHeaders } from '@tanstack/react-start/server';

export const getRootLoaderDataFn = createServerFn({ method: 'GET' })
  .middleware([servicesMiddleware])
  .handler(async ({ context }) => {
    const request = getRequest();
    const appConfig = context.appConfig;

    const [locale, csrfToken, toastMessage] = await Promise.all([
      getLocale(request),
      commitCsrfToken(request),
      getToast(),
    ]);

    // Create per-locale SSR i18next instance and register it so App() can pick it up
    // synchronously during the server-side render pass.
    const i18nInstance = makeI18nextServerInstance(locale);
    registerSSRInstance(locale, i18nInstance);

    const timezone = getPreferencesCookie(request, 'timezone') ?? 'UTC';
    const theme = getPreferencesCookie(request, 'theme') ?? 'light';
    const ENV = getClientEnvVars();

    const segmentApiKey = getServerEnv('SEGMENT_WRITE_KEY');
    const disableSegment = getServerEnv('DISABLE_SEGMENT') ?? false;
    const segmentScript = !disableSegment && segmentApiKey ? getSegmentScript(segmentApiKey) : undefined;

    // Generate a per-request CSP nonce and set the Content-Security-Policy header.
    const nonce = crypto.randomUUID().replace(/-/g, '');

    const firebaseUrl = appConfig.auth.firebase.isEmulator
      ? [appConfig.auth.firebase.emulatorUrl]
      : ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'];

    const externalDomains = ['cdn.segment.com', 'api.segment.io', '*.sentry.io', '*.maplibre.org', '*.cartocdn.com'];

    const frames: string[] = [];
    const metabaseUrl = ENV.METABASE_URL ?? appConfig.urls.metabase;
    const fbAuthDomain = appConfig.auth.firebase.authDomain;
    if (metabaseUrl) frames.push(metabaseUrl);
    if (fbAuthDomain) frames.push(fbAuthDomain);

    const imgSrc: string[] = ["'self'", 'data:'];
    if (ENV.CUSTOM_LOGO_URL) {
      try {
        imgSrc.push(new URL(ENV.CUSTOM_LOGO_URL).origin);
      } catch {
        // Invalid URL — skip
      }
    }
    for (const blobDomain of appConfig.urls.blobs) {
      imgSrc.push(blobDomain);
    }

    const csp = createContentSecurityPolicy({
      baseUri: ["'none'"],
      defaultSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: [`'nonce-${nonce}'`, "'unsafe-eval'", "'strict-dynamic'"],
      connectSrc: ["'self'", ...firebaseUrl, ...externalDomains.map((d) => `https://${d}`)],
      imgSrc,
      frameSrc: frames.length > 0 ? frames : ["'none'"],
    });

    // Set CSP header.
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Security-Policy', csp);
    setResponseHeaders(responseHeaders);

    return { ENV, locale, timezone, theme, csrf: csrfToken, toastMessage, segmentScript, appConfig, nonce };
  });
