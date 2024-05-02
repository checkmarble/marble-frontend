import { Page } from '@app-builder/components';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation'] satisfies Namespace,
};

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
