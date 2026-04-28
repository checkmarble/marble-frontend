import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useSetLanguageMutation } from '@app-builder/queries/settings/set-language';
import { languageNames, supportedLngs } from '@app-builder/services/i18n/i18n-config';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

/**
 * The component is hidden when there is only one language available.
 */
export function LanguagePicker() {
  const {
    t,
    i18n: { language },
  } = useTranslation<'common'>('common');
  const setLanguageMutation = useSetLanguageMutation();
  const revalidate = useLoaderRevalidator();

  if (supportedLngs.every((lng: string) => lng.startsWith('en'))) return null;

  return (
    <Select.Default
      value={language}
      onValueChange={(newPreferredLanguage: (typeof supportedLngs)[number]) => {
        setLanguageMutation
          .mutateAsync({ preferredLanguage: newPreferredLanguage })
          .then(() => {
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }}
    >
      {supportedLngs.map((lng) => {
        return (
          <Select.DefaultItem dir={languageNames[lng].dir} key={lng} value={lng}>
            {languageNames[lng].name}
          </Select.DefaultItem>
        );
      })}
    </Select.Default>
  );
}
