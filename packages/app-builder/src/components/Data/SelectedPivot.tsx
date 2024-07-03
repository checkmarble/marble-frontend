import { type DataModel, type Pivot } from '@app-builder/models/data-model';
import { getLinksToSingleMap } from '@app-builder/services/data/data-model';
import { getPivotDisplayValue } from '@app-builder/services/data/pivot';
import { createSimpleContext } from '@app-builder/utils/create-context';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from 'reactflow';
import * as R from 'remeda';
import { Button, Tag } from 'ui-design-system';

import { dataI18n } from './data-i18n';

interface SelectedPivotContextValue {
  displayPivot: boolean;
  selectedPivot?: Pivot;
  setSelectedPivot: (pivot?: Pivot) => void;
  isLinkPartOfPivot: (linkId: string) => boolean;
  isFieldPartOfPivot: (fieldId: string) => boolean;
  isTablePartOfPivot: (tableId: string) => boolean;
}

const SelectedPivotContext = createSimpleContext<SelectedPivotContextValue>(
  'SelectedPivotContext',
);

export function useSelectedPivot() {
  return SelectedPivotContext.useValue();
}

export function SelectedPivotProvider({
  dataModel,
  children,
}: {
  dataModel: DataModel;
  children: React.ReactNode;
}) {
  const linksToSingleMap = React.useMemo(
    () => getLinksToSingleMap(dataModel),
    [dataModel],
  );

  const [selectedPivot, setSelectedPivot] = React.useState<Pivot | undefined>(
    undefined,
  );

  const displayPivot = selectedPivot !== undefined;

  const isLinkPartOfPivot = React.useCallback(
    (linkId: string) => {
      if (selectedPivot === undefined) return false;
      if (selectedPivot.type === 'field') return false;

      return selectedPivot.pathLinkIds.includes(linkId);
    },
    [selectedPivot],
  );

  const selectedPathLinks = React.useMemo(() => {
    if (selectedPivot === undefined) return [];
    if (selectedPivot.type === 'field') return [];

    return R.pipe(
      selectedPivot.pathLinkIds,
      R.map((linkId) => linksToSingleMap.get(linkId)),
      R.filter(R.isNonNullish),
    );
  }, [selectedPivot, linksToSingleMap]);

  const isFieldPartOfPivot = React.useCallback(
    (fieldId: string) => {
      if (selectedPivot === undefined) return false;
      if (selectedPivot.type === 'field') {
        return selectedPivot.fieldId === fieldId;
      }

      return selectedPathLinks.some(
        (link) =>
          link?.childFieldId === fieldId || link?.parentFieldId === fieldId,
      );
    },
    [selectedPivot, selectedPathLinks],
  );

  const isTablePartOfPivot = React.useCallback(
    (tableId: string) => {
      if (selectedPivot === undefined) return false;
      if (selectedPivot.type === 'field') {
        return selectedPivot.baseTableId === tableId;
      }

      return selectedPathLinks.some(
        (link) =>
          link?.childTableId === tableId || link?.parentTableId === tableId,
      );
    },
    [selectedPivot, selectedPathLinks],
  );

  return (
    <SelectedPivotContext.Provider
      value={{
        displayPivot,
        selectedPivot,
        setSelectedPivot,
        isLinkPartOfPivot,
        isFieldPartOfPivot,
        isTablePartOfPivot,
      }}
    >
      {children}
    </SelectedPivotContext.Provider>
  );
}

export function SelectedPivotPanel() {
  const { t } = useTranslation(dataI18n);
  const { displayPivot, selectedPivot, setSelectedPivot } = useSelectedPivot();
  if (!displayPivot) return null;

  let pivotInfo = null;
  if (selectedPivot?.type === 'field') {
    pivotInfo = (
      <div className="grid grid-cols-[max-content_max-content] items-center gap-x-6 gap-y-4">
        <span className="text-grey-50 text-s">{t('data:view_pivot.type')}</span>
        <PivotType type="field" />

        <span className="text-grey-50 text-s">
          {t('data:view_pivot.table')}
        </span>
        <span className="text-m text-grey-100">{selectedPivot?.baseTable}</span>

        <span className="text-grey-50 text-s">
          {t('data:view_pivot.definition')}
        </span>
        <span>{getPivotDisplayValue(selectedPivot)}</span>
      </div>
    );
  }
  if (selectedPivot?.type === 'link') {
    pivotInfo = (
      <div className="grid grid-cols-[max-content_max-content] items-center gap-x-6 gap-y-4">
        <span className="text-grey-50 text-s">{t('data:view_pivot.type')}</span>
        <PivotType type="link" />

        <span className="text-grey-50 text-s">
          {t('data:view_pivot.table')}
        </span>
        <span className="text-m text-grey-100">
          {selectedPivot?.baseTable}→{selectedPivot?.pivotTable}
        </span>

        <span className="text-grey-50 text-s">
          {t('data:view_pivot.definition')}
        </span>
        <span>{getPivotDisplayValue(selectedPivot)}</span>
      </div>
    );
  }

  return (
    <Panel position="bottom-center">
      <div className="bg-grey-00 border-grey-10 flex min-w-60 flex-col overflow-hidden rounded border drop-shadow-md">
        <p className="text-l bg-grey-02 border-b-grey-10 border-b p-4 font-semibold">
          {t('data:view_pivot.title')}
        </p>

        <div className="flex flex-col gap-4 rounded p-4">
          {pivotInfo}

          <div className="flex flex-row-reverse">
            <Button onClick={() => setSelectedPivot(undefined)}>
              {t('common:close')}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function PivotType({ type }: { type: 'field' | 'link' }) {
  return (
    <Tag
      size="small"
      border="square"
      color={type === 'field' ? 'grey' : 'purple'}
      className="w-fit"
    >
      {type}
    </Tag>
  );
}
