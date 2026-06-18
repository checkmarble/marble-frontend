import { Callout } from '@app-builder/components/Callout';
import {
  DatasetSelectionContent,
  ListAndTopicDatasetConfiguration,
} from '@app-builder/components/ListAndTopicConfiguration';
import { type AvailableFeatures } from '@app-builder/models/screening';
import { useTranslation } from 'react-i18next';

export const DatasetSelection = ({ useCase }: { useCase: AvailableFeatures }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const tKey = mode === 'view' ? 'view' : 'creation';

  return (
    <div className="flex flex-col gap-md">
      <Callout bordered className="bg-surface-card mx-md">
        {t(`continuousScreening:${tKey}.datasetSelection.callout`)}
      </Callout>
      <div className="bg-surface-card rounded-lg border border-grey-border">
        <DatasetSelectionContent useCase={useCase} />
      </div>
    </div>
  );
};
