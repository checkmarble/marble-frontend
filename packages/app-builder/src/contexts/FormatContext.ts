import { createSimpleContext } from '@marble/shared';

export interface FormatContextValue {
  locale: string;
  timezone: string;
}

/**
 * Context for providing locale and timezone for formatting dates, numbers, and currencies.
 *
 * This context is set from the root loader data, which ensures values are available
 * synchronously during both SSR and client-side hydration, avoiding hydration mismatches.
 *
 * Use hooks from `@app-builder/utils/format` to access these values:
 * - `useFormatLanguage()` - returns locale string
 * - `useFormatDateTime()` - returns pre-configured date formatting function
 */
export const FormatContext = createSimpleContext<FormatContextValue>('Format');
