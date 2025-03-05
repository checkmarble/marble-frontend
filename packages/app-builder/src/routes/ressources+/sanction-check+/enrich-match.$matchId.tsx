import { sanctionsI18n } from '@app-builder/components/Sanctions/sanctions-i18n';
import { serverServices } from '@app-builder/services/init.server';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const matchId = fromParams(params, 'matchId');

  return Response.json({
    match: await sanctionCheck.enrichMatch({ matchId }),
  });
}

export function EnrichMatchButton({ matchId }: { matchId: string }) {
  const { t } = useTranslation(sanctionsI18n);
  const fetcher = useFetcher<typeof action>();
  const handleButtonClick = useCallbackRef(() => {
    fetcher.submit(
      {},
      {
        method: 'POST',
        action: getRoute('/ressources/sanction-check/enrich-match/:matchId', {
          matchId: fromUUID(matchId),
        }),
      },
    );
  });

  return (
    <Button type="button" variant="secondary" className="h-8" onClick={handleButtonClick}>
      <Icon icon="download" className="size-5" />
      {t('sanctions:enrich_button')}
    </Button>
  );
}
