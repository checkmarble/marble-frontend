import { getLocalStorageItem, setLocalStorageItem } from '@app-builder/utils/local-storage';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { getSummarizerAvailability, isSummarizerSupported } from './useChromeSummarizer';

// Candidate output languages; only the ones the browser's summarizer supports are offered,
// so new languages show up as soon as Chrome ships them.
const CANDIDATE_LANGUAGES = ['en', 'fr', 'es', 'de', 'ja', 'zh', 'ar', 'it', 'pt', 'nl'];
const FALLBACK_LANGUAGE = 'en';
const STORAGE_KEY = 'screening-ai-summary-language';

let supportedLanguagesPromise: Promise<string[]> | null = null;

function getSupportedLanguages() {
  supportedLanguagesPromise ??= Promise.all(
    CANDIDATE_LANGUAGES.map(async (language) =>
      (await getSummarizerAvailability(language)) === 'unavailable' ? null : language,
    ),
  ).then((languages) => languages.filter((language): language is string => language !== null));
  return supportedLanguagesPromise;
}

const preferenceListeners = new Set<() => void>();

function subscribePreference(listener: () => void) {
  preferenceListeners.add(listener);
  return () => preferenceListeners.delete(listener);
}

function setPreferredLanguage(language: string) {
  setLocalStorageItem(STORAGE_KEY, language);
  preferenceListeners.forEach((listener) => listener());
}

/**
 * Output language of the AI summaries, shared by every card and persisted in localStorage.
 * `languages` is `null` while support is being checked and empty when the summarizer is unavailable.
 */
export function useSummaryLanguage() {
  const { i18n } = useTranslation();
  const [languages, setLanguages] = useState<string[] | null>(null);
  const preferredLanguage = useSyncExternalStore(
    subscribePreference,
    () => getLocalStorageItem<string>(STORAGE_KEY),
    () => null,
  );

  useEffect(() => {
    if (!isSummarizerSupported()) return setLanguages([]);
    let cancelled = false;
    void getSupportedLanguages().then((supported) => {
      if (!cancelled) setLanguages(supported);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const uiLanguage = i18n.language.split('-')[0] ?? FALLBACK_LANGUAGE;
  const language = languages?.length
    ? ([preferredLanguage, uiLanguage, FALLBACK_LANGUAGE].find(
        (candidate): candidate is string => !!candidate && languages.includes(candidate),
      ) ?? languages[0])
    : undefined;

  return { languages, language, setLanguage: setPreferredLanguage };
}
