import { Callout } from '@app-builder/components/Callout';
import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { ScreeningCategory } from '@app-builder/models/screening';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { useCallbackRef } from '@marble/shared';
import * as Collapsible from '@radix-ui/react-collapsible';
import { OpenSanctionsCatalogDataset, OpenSanctionsCatalogSection } from 'marble-api';
import { MouseEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Checkbox } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningCreationStepper } from '../../context/CreationStepper';

export const DatasetSelection = () => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const datasetsQuery = useScreeningDatasetsQuery();

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-surface-card mx-v2-md">
        {t('continuousScreening:creation.datasetSelection.callout')}
      </Callout>
      <div className="bg-surface-card rounded-v2-lg border border-grey-border">
        <div className="border-b border-grey-border p-v2-md flex justify-between items-center">
          <span className="text-s font-semibold">{t('continuousScreening:creation.datasetSelection.list.title')}</span>
          <SelectedListsCount />
        </div>
        <div className="p-v2-md overflow-y-auto">
          {match(datasetsQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center h-50">
                <Spinner className="size-10" />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="flex flex-col gap-v2-md items-center justify-center h-50">
                <div className="">{t('common:generic_fetch_data_error')}</div>
                <ButtonV2 variant="secondary" onClick={() => datasetsQuery.refetch()}>
                  {t('common:retry')}
                </ButtonV2>
              </div>
            ))
            .with({ isSuccess: true }, ({ data }) => {
              return (
                <div className="flex flex-col gap-v2-md">
                  {data.datasets.sections.map((datasetSection) => (
                    <DatasetSection key={datasetSection.name} section={datasetSection} />
                  ))}
                </div>
              );
            })
            .exhaustive()}
        </div>
      </div>
    </div>
  );
};

const SelectedListsCount = () => {
  const { t } = useTranslation(['continuousScreening']);
  const selectedDatasetsCount = ContinuousScreeningCreationStepper.select(
    (state) => Object.values(state.data.datasets).filter(Boolean).length,
  );
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: selectedDatasetsCount })}</span>;
};

const DatasetSection = ({ section }: { section: OpenSanctionsCatalogSection }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible.Root className="flex flex-col gap-v2-sm group/collapsible">
      <Collapsible.Trigger asChild>
        <span className="text-s flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex gap-v2-md items-center">
            <Icon
              icon="caret-down"
              className="size-4 shrink-0 group-radix-state-open/collapsible:rotate-180 transition-transform duration-200"
            />
            <span className="font-semibold">{section.title}</span>
          </div>
          <SelectAllCheckbox section={section} />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col border border-grey-border rounded-v2-md overflow-hidden bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        {section.datasets.map((dataset) => (
          <DatasetItem key={dataset.name} dataset={dataset} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const DatasetItem = ({ dataset }: { dataset: OpenSanctionsCatalogDataset }) => {
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const isSelected = ContinuousScreeningCreationStepper.select((state) => state.data.datasets[dataset.name]);
  const handleChange = useCallbackRef(() => {
    const stepperData = creationStepper.value.data;
    stepperData.datasets[dataset.name] = !stepperData.datasets[dataset.name];
  });

  return (
    <div
      className="flex flex-row items-center justify-between p-v2-md even:bg-grey-background-light"
      onClick={handleChange}
    >
      <div className="flex flex-row items-center gap-v2-sm">
        <Checkbox size="small" checked={isSelected} />
        <span className="text-s">{dataset.title}</span>
      </div>
      {dataset.tag ? <DatasetTag category={dataset.tag as ScreeningCategory} /> : null}
    </div>
  );
};

const SelectAllCheckbox = ({ section }: { section: OpenSanctionsCatalogSection }) => {
  const { t } = useTranslation(['continuousScreening']);
  const creationStepper = ContinuousScreeningCreationStepper.useSharp();
  const selectedState = ContinuousScreeningCreationStepper.select((state) => {
    const selectedCount = section.datasets.filter((dataset) => state.data.datasets[dataset.name]).length;
    return selectedCount === section.datasets.length ? true : selectedCount === 0 ? false : 'indeterminate';
  });
  const handleClick = useCallbackRef((e: MouseEvent) => {
    e.stopPropagation();
    const nextState = selectedState === true ? false : true;
    const datasetsNames = section.datasets.map((d) => d.name);

    datasetsNames.forEach((datasetName) => {
      creationStepper.value.data.datasets[datasetName] = nextState;
    });
  });

  return (
    <div className="flex items-center gap-v2-sm" onClick={handleClick}>
      <Checkbox size="small" checked={selectedState} />
      <span>
        {t(
          `continuousScreening:creation.datasetSelection.list.section.${selectedState === true ? 'unselect_all' : 'select_all'}`,
        )}
      </span>
    </div>
  );
};
