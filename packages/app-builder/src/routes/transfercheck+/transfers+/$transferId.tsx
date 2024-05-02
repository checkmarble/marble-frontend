import { CopyToClipboardButton, Page } from '@app-builder/components';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

export const handle = {
  i18n: ['common', 'transfercheck'] satisfies Namespace,
};

export default function TransferDetailPage() {
  const { t } = useTranslation(handle.i18n);
  const transferId = 'TODO';

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          {t('transfercheck:transfer_detail')}
          <CopyToClipboardButton toCopy={transferId}>
            <span className="text-s font-normal">
              <span className="font-medium">ID</span> {transferId}
            </span>
          </CopyToClipboardButton>
        </div>
      </Page.Header>

      <Page.Content>
        <div>TODO</div>
      </Page.Content>
    </Page.Container>
  );
}
