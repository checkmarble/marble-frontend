import { screeningsI18n } from '@app-builder/components/Screenings/screenings-i18n';
import { useEnrichMatchMutation } from '@app-builder/queries/screening/enrich-match';
import { useCallbackRef } from '@marble/shared';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function EnrichMatchButton({ matchId }: { matchId: string }) {
  const { t } = useTranslation(screeningsI18n);
  const enrichMatchMutation = useEnrichMatchMutation();
  const router = useRouter();

  const handleButtonClick = useCallbackRef(() => {
    enrichMatchMutation
      .mutateAsync(matchId)
      .then((res) => {
        if (res && 'error' in res) {
          toast.error(t('screenings:error.match_already_enriched'));
          return;
        }
        toast.success(t('screenings:success.match_enriched'));
        router.invalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  });

  return (
    <Button type="button" variant="secondary" className="h-8" onClick={handleButtonClick}>
      <Icon icon="download" className="size-5" />
      {t('screenings:enrich_button')}
    </Button>
  );
}
