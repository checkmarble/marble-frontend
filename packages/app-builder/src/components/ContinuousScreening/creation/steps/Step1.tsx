import { Callout } from '@app-builder/components/Callout';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import { useCallbackRef } from '@marble/shared';
import * as Collapsible from '@radix-ui/react-collapsible';
import { OpenSanctionsCatalogDataset, OpenSanctionsCatalogSection } from 'marble-api';
import { useState } from 'react';
import { match } from 'ts-pattern';
import { Checkbox } from 'ui-design-system';
import { CreationStepperSharp } from '../../context/CreationStepper';

export const Step1 = () => {
  const datasetsQuery = useScreeningDatasetsQuery();

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-white">
        Select lists that are relevant to your business
      </Callout>
      <div className="bg-white rounded-v2-lg border border-grey-border">
        <div className="border-b border-grey-border p-v2-md flex justify-between items-center">
          <span className="text-s font-semibold">Lists</span>
          <SelectedListsCount />
        </div>
        <div className="p-v2-md min-h-100">
          {match(datasetsQuery)
            .with({ isPending: true }, () => <div>Loading...</div>)
            .with({ isError: true }, () => <div>Error</div>)
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
      <div className="">Recap</div>
    </div>
  );
};

const SelectedListsCount = () => {
  const selectedListsCount = CreationStepperSharp.select(
    (state) => Object.values(state.value.lists).filter(Boolean).length,
  );
  return <span>{selectedListsCount} list selected</span>;
};

const DatasetSection = ({ section }: { section: OpenSanctionsCatalogSection }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible.Root className="flex flex-col gap-v2-sm">
      <Collapsible.Trigger asChild>
        <span className="text-s flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="font-semibold">{section.title}</span>
          <SelectAllCheckbox />
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="flex flex-col border border-grey-border rounded-v2-md overflow-hidden bg-white radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        {section.datasets.map((dataset) => (
          <DatasetItem key={dataset.name} dataset={dataset} />
        ))}
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const DatasetItem = ({ dataset }: { dataset: OpenSanctionsCatalogDataset }) => {
  const creationStepper = CreationStepperSharp.useSharp();
  const isSelected = CreationStepperSharp.select((state) => state.value.lists[dataset.name]);
  const handleChange = useCallbackRef(() => {
    creationStepper.actions.toggleList(dataset.name);
  });

  return (
    <div
      className="flex flex-row items-center justify-between p-v2-md even:bg-grey-background-light"
      onClick={handleChange}
    >
      <span className="text-s">{dataset.title}</span>
      <Checkbox size="small" checked={isSelected} />
    </div>
  );
};

const SelectAllCheckbox = () => {
  return (
    <div className="flex items-center gap-v2-sm">
      <Checkbox size="small" checked={false} />
      <span>Select all</span>
    </div>
  );
};
