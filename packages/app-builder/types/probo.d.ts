import { type DetailedHTMLProps, type HTMLAttributes } from 'react';

type ProboElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /**
       * Probo themed cookie consent banner (@probo/cookie-banner)
       */
      'probo-cookie-banner': ProboElementProps & {
        'banner-id': string;
        'base-url': string;
        position?: 'bottom-left' | 'bottom-center' | 'bottom-right' | 'top-left' | 'top-center' | 'top-right';
        lang?: string;
        'gcm-enabled'?: 'true' | 'false';
      };
      /**
       * Reopen control for cookie preferences. Render it childless: the SDK fills
       * in a localized label (and swaps it for the statutory "Your Privacy Choices"
       * content under CCPA) by mutating the light DOM — children rendered by React
       * would be clobbered.
       */
      'probo-settings-link': ProboElementProps;
    }
  }
}
