import { createContext, useContext } from 'react';

export type SupportedLanguage = string;

export type FormatDateTimeOptions = Intl.DateTimeFormatOptions & {
  language?: SupportedLanguage;
};

export interface FormattingContextValue {
  language: SupportedLanguage;
  formatDateTimeWithoutPresets: (date: Date | string, options?: FormatDateTimeOptions) => string;
  formatDuration: (duration: string, language?: SupportedLanguage) => string;
}

const defaultLanguage: SupportedLanguage = 'en';

function defaultFormatDateTimeWithoutPresets(date: Date | string, options?: FormatDateTimeOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const lang = options?.language ?? defaultLanguage;
  try {
    // Provide a sane default with short date unless options override
    const fmt = new Intl.DateTimeFormat(lang, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(options ?? {}),
    });
    return fmt.format(d);
  } catch {
    return d.toString();
  }
}

function defaultFormatDuration(duration: string, language?: SupportedLanguage): string {
  // Very lightweight humanization for negative Temporal durations like "-P7D", "-P6M"
  // Fallback to the raw string if we cannot parse.
  const lang = language ?? defaultLanguage;
  try {
    // Minimal parse: expect patterns like PnD, PnM, PnY with optional leading minus
    const negative = duration.startsWith('-');
    const raw = negative ? duration.slice(1) : duration;
    const match = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/i.exec(raw);
    if (!match) return duration;
    const years = Number(match[1] ?? 0);
    const months = Number(match[2] ?? 0);
    const days = Number(match[3] ?? 0);
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'always', style: 'long' });
    if (years) return rtf.format(-years, 'year');
    if (months) return rtf.format(-months, 'month');
    if (days) return rtf.format(-days, 'day');
    return duration;
  } catch {
    return duration;
  }
}

const FormattingContext = createContext<FormattingContextValue>({
  language: defaultLanguage,
  formatDateTimeWithoutPresets: defaultFormatDateTimeWithoutPresets,
  formatDuration: defaultFormatDuration,
});

export function FormattingProvider({ value, children }: { value: FormattingContextValue; children: React.ReactNode }) {
  return <FormattingContext.Provider value={value}>{children}</FormattingContext.Provider>;
}

export function useFormatting(): FormattingContextValue {
  return useContext(FormattingContext);
}

export function useFormatLanguage(): SupportedLanguage {
  return useContext(FormattingContext).language;
}
