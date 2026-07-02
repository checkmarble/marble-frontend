import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { registerSSRInstance } from '@app-builder/services/i18n/i18n-instance-store';
import { getLocale, makeI18nextServerInstance } from '@app-builder/services/i18n/i18next.server';
import { getSegmentScript } from '@app-builder/services/segment/segment.server';
import { getToast } from '@app-builder/services/toast.server';
import { commitCsrfToken } from '@app-builder/utils/csrf.server';
import { getClientEnvVars, getServerEnv } from '@app-builder/utils/environment';
import { getPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookie-read.server';
import { getRequestNonce, setContentSecurityPolicy } from '@app-builder/utils/security-headers.server';
import { createContentSecurityPolicy } from '@mcansh/http-helmet';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

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

    // Use the per-request nonce opened by `securityHeadersMiddleware`, so this CSP, the
    // hydration scripts (`router.ssr.nonce`), and the inline scripts below all match.
    // Fallback keeps the loader resilient if it ever runs outside that middleware scope.
    const nonce = getRequestNonce() ?? crypto.randomUUID().replace(/-/g, '');

    const firebaseUrl = appConfig.auth.firebase.isEmulator
      ? [appConfig.auth.firebase.emulatorUrl]
      : ['https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'];

    const externalDomains = ['cdn.segment.com', 'api.segment.io', '*.sentry.io', '*.maplibre.org', '*.cartocdn.com'];

    const frames: string[] = [];
    const metabaseUrl = ENV.METABASE_URL ?? appConfig.urls.metabase;
    const fbAuthDomain = appConfig.auth.firebase.authDomain;
    if (metabaseUrl) frames.push(metabaseUrl);
    if (fbAuthDomain) frames.push(fbAuthDomain);

    // Firebase phone-auth MFA renders an invisible reCAPTCHA hosted by Google (iframe +
    // XHR). The emulator disables app verification, so this is only needed against real
    // Firebase.
    const recaptchaDomains = !appConfig.auth.firebase.isEmulator
      ? ['https://www.google.com', 'https://recaptcha.google.com']
      : [];
    frames.push(...recaptchaDomains);

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
      connectSrc: ["'self'", ...firebaseUrl, ...recaptchaDomains, ...externalDomains.map((d) => `https://${d}`)],
      imgSrc,
      frameSrc: frames.length > 0 ? frames : ["'none'"],
    });

    // Publish the CSP to `securityHeadersMiddleware` (see start.ts), which sets it on
    // the document response. We cannot set it here directly: this server fn runs in its
    // own H3 event scope, so `setResponseHeaders` never reaches the streamed document.
    setContentSecurityPolicy(csp);

    return { ENV, locale, timezone, theme, csrf: csrfToken, toastMessage, segmentScript, appConfig, nonce };
  });
