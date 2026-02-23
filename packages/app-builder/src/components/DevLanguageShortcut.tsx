import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useSetLanguageMutation } from '@app-builder/queries/settings/set-language';
import { supportedLngs } from '@app-builder/services/i18n/i18n-config';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Keyboard shortcut (Ctrl+L) to cycle through supported languages.
 * Intended for QA/dev testing, mirroring the Ctrl+D theme toggle in ThemeProvider.
 */
export function DevLanguageShortcut() {
  const {
    i18n: { language },
  } = useTranslation();
  const setLanguageMutation = useSetLanguageMutation();
  const revalidate = useLoaderRevalidator();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        const currentIndex = supportedLngs.indexOf(language as (typeof supportedLngs)[number]);
        const nextIndex = (currentIndex + 1) % supportedLngs.length;
        const nextLang = supportedLngs[nextIndex];
        if (!nextLang) return;
        setLanguageMutation.mutate({ preferredLanguage: nextLang }, { onSuccess: () => revalidate() });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, setLanguageMutation, revalidate]);

  return null;
}
