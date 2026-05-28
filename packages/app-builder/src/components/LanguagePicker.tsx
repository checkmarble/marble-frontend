import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useSetLanguageMutation } from '@app-builder/queries/settings/set-language';
import { languageNames, supportedLngs } from '@app-builder/services/i18n/i18n-config';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { type SelectOption, SelectV2 } from 'ui-design-system';

type SupportedLngs = (typeof supportedLngs)[number];

const languageOptions: SelectOption<SupportedLngs>[] = supportedLngs.map((lng) => ({
  value: lng,
  label: <span dir={languageNames[lng].dir}>{languageNames[lng].name}</span>,
}));

/**
 * The component is hidden when there is only one language available.
 */
export function LanguagePicker() {
  const {
    t,
    i18n: { language, changeLanguage },
  } = useTranslation<'common'>('common');
  const setLanguageMutation = useSetLanguageMutation();
  const revalidate = useLoaderRevalidator();

  if (supportedLngs.every((lng: string) => lng.startsWith('en'))) return null;

  return (
    <SelectV2
      options={languageOptions}
      value={language as SupportedLngs}
      onChange={(newPreferredLanguage) => {
        setLanguageMutation
          .mutateAsync({ preferredLanguage: newPreferredLanguage })
          .then(() => {
            changeLanguage(newPreferredLanguage);
            revalidate();
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }}
      placeholder={languageNames['en-GB'].name}
    />
  );
}
