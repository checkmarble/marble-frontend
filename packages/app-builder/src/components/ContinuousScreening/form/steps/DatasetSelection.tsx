import { Callout } from '@app-builder/components/Callout';
import {
  DatasetSelectionContent,
  ListAndTopicDatasetConfiguration,
} from '@app-builder/components/ListAndTopicConfiguration';
import { AvailableFeatures } from '@app-builder/server-fns/screenings';
import { useTranslation } from 'react-i18next';

export const DatasetSelection = ({ useCase }: { useCase: AvailableFeatures }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const tKey = mode === 'view' ? 'view' : 'creation';

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-surface-card mx-v2-md">
        {t(`continuousScreening:${tKey}.datasetSelection.callout`)}
      </Callout>
      <div className="bg-surface-card rounded-v2-lg border border-grey-border">
        <DatasetSelectionContent useCase={useCase} />
      </div>
    </div>
  );
};
