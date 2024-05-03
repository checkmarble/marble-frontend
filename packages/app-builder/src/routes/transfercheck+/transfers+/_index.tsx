import { Page } from '@app-builder/components';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation'] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { transferRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const transfers = await transferRepository.listTransfers({
    partnerTransferId: 'TODO',
  });

  return json({
    transfers,
  });
}

export default function TransfersPage() {
  const { t } = useTranslation(handle.i18n);

  return (
    <Page.Container>
      <Page.Header>
        <Icon icon="arrows-right-left" className="mr-2 size-6" />
        {t('navigation:transfercheck.transfers')}
      </Page.Header>

      <Page.Content>
        <div>TODO</div>
      </Page.Content>
    </Page.Container>
  );
}
