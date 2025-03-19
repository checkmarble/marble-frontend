import { Page } from '@app-builder/components';
import { Spinner } from '@app-builder/components/Spinner';
import { transfersI18n } from '@app-builder/components/Transfers/transfers-i18n';
import { TransfersList } from '@app-builder/components/Transfers/TransfersList';
import { type Transfer } from '@app-builder/models/transfer';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, useLoaderData, useNavigation, useSubmit } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...transfersI18n] satisfies Namespace,
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = initServerServices(request);
  const { transferRepository } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const url = new URL(request.url);
  const transferId = url.searchParams.get('transferId');

  if (!transferId) {
    return json({
      transfers: [] as Transfer[],
      transferId,
    });
  }

  const transfers = await transferRepository.listTransfers({
    partnerTransferId: transferId,
  });

  return json({
    transfers,
    transferId,
  });
}

export default function TransfersPage() {
  const { t } = useTranslation(handle.i18n);
  const { transfers, transferId } = useLoaderData<typeof loader>();

  const submit = useSubmit();
  const navigation = useNavigation();
  const isLoading =
    navigation.state === 'loading' &&
    navigation.location.pathname === getRoute('/transfercheck/transfers/');

  const [query, setQuery] = React.useState(transferId || '');

  return (
    <Page.Main>
      <Page.Header>
        <Icon icon="transfercheck" className="me-2 size-6" />
        {t('navigation:transfercheck.transfers')}
      </Page.Header>
      <Page.Container>
        <Page.Content className="max-w-3xl">
          <Form
            id="search-form"
            onChange={(event) => submit(event.currentTarget, { replace: true })}
            role="search"
          >
            <div className="flex flex-row items-center gap-2">
              <Input
                className="w-full max-w-lg"
                type="search"
                aria-label={t('transfercheck:transfer.search.placeholder')}
                placeholder={t('transfercheck:transfer.search.placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                startAdornment="search"
                name="transferId"
              />
              <Spinner className={clsx('size-6', !isLoading && 'hidden')} />
            </div>
          </Form>
          <TransfersList transfers={transfers} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
