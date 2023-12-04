import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useGetCopyToClipboard() {
  const { t } = useTranslation('common');
  return (value: string) => ({
    type: 'button',
    'aria-label': t('clipboard.aria-label', {
      replace: {
        value,
      },
    }),
    onClick: async () => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(
          t('clipboard.copy', {
            replace: {
              value,
            },
          }),
        );
      } catch (err) {
        toast.error(t('errors.unknown'));
      }
    },
  });
}
