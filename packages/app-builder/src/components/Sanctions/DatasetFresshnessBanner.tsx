import { useOpenSanctionsDatasetFreshnessInfo } from '@app-builder/queries/opensanctions-dataset-freshness-info';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { Trans, useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

export function DatasetFreshnessBanner() {
  const { t } = useTranslation(['common']);
  const language = useFormatLanguage();
  const datasetFreshnessQuery = useOpenSanctionsDatasetFreshnessInfo();

  if (!datasetFreshnessQuery.isSuccess || !datasetFreshnessQuery.data) {
    return null;
  }

  return (
    <div className="text-red-47 bg-red-95 border-b-red-74 flex h-0 items-center gap-2 border-b-[0.5px] p-4 lg:px-8">
      <Icon icon="error" className="size-5" />
      <span>
        <Trans
          t={t}
          i18nKey="common:dataset_freshness_banner"
          values={{
            lastExport: formatDateTime(datasetFreshnessQuery.data.lastExport, {
              language,
              timeStyle: undefined,
            }),
          }}
        />
      </span>
    </div>
  );
}
