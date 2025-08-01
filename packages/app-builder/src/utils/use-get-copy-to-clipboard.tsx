import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';

export function useGetCopyToClipboard() {
  const { t } = useTranslation('common');
  return (value: string) => ({
    'aria-label': t('clipboard.aria-label', {
      replace: {
        value,
      },
    }),
    onClick: async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(() => (
          <span className="text-s text-grey-00 font-normal first-letter:capitalize">
            <Trans
              t={t}
              i18nKey="clipboard.copy"
              components={{
                Value: (
                  <span className="text-s text-grey-00 whitespace-pre-wrap break-all font-semibold" />
                ),
              }}
              values={{
                value,
              }}
            />
          </span>
        ));
      } catch (_err) {
        toast.error(t('errors.unknown'));
      }
    },
  });
}
