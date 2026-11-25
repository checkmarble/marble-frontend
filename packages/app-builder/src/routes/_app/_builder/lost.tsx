import { Page } from '@app-builder/components';
import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_builder/lost')({
  component: Lost,
});

function Lost() {
  const { t } = useTranslation(['common']);

  return (
    <Page.Main>
      <Page.Content className="items-center justify-center">
        <div className="border-grey-border bg-surface-card flex max-w-md flex-col items-center gap-md rounded-lg border p-xl">
          <div className="bg-purple-background-light flex size-12 items-center justify-center rounded-full">
            <Icon icon="lock" className="text-purple-primary size-6" />
          </div>
          <p className="text-grey-primary text-center text-m font-semibold">{t('common:lost.title')}</p>
          <p className="text-grey-secondary text-center text-s">{t('common:lost.subtitle')}</p>
        </div>
      </Page.Content>
    </Page.Main>
  );
}
