import { sanctionsI18n } from '@app-builder/components/Screenings/screenings-i18n';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useEnrichMatchMutation } from '@app-builder/queries/screening/enrich-match';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function EnrichMatchButton({ matchId }: { matchId: string }) {
  const { t } = useTranslation(sanctionsI18n);
  const enrichMatchMutation = useEnrichMatchMutation();
  const revalidate = useLoaderRevalidator();

  const handleButtonClick = useCallbackRef(() => {
    enrichMatchMutation.mutateAsync(matchId).then(() => {
      revalidate();
    });
  });

  return (
    <Button type="button" variant="secondary" className="h-8" onClick={handleButtonClick}>
      <Icon icon="download" className="size-5" />
      {t('sanctions:enrich_button')}
    </Button>
  );
}
