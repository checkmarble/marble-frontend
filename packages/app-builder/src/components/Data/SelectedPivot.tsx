import { type DataModel, type Pivot } from '@app-builder/models/data-model';
import { createSimpleContext } from '@app-builder/utils/create-context';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from 'reactflow';
import * as R from 'remeda';
import { Button } from 'ui-design-system';

import { dataI18n } from './data-i18n';

interface SelectedPivotContextValue {
  displayPivot: boolean;
  selectedPivotInfo?: {
    tableName: string;
    displayedPath: string;
  };
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
    () =>
      new Map(
        dataModel
          .flatMap((table) => table.linksToSingle)
          .map((link) => [link.id, link]),
      ),
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
      R.filter(R.isDefined),
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

  const selectedPivotInfo = selectedPivot
    ? {
        tableName: selectedPivot.baseTable,
        displayedPath:
          selectedPathLinks.length > 0
            ? selectedPathLinks.map((link) => link.name).join('.')
            : selectedPivot.field,
      }
    : undefined;

  return (
    <SelectedPivotContext.Provider
      value={{
        displayPivot,
        selectedPivotInfo,
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
  const { displayPivot, selectedPivotInfo, setSelectedPivot } =
    useSelectedPivot();
  if (!displayPivot) return null;

  return (
    <Panel position="bottom-center">
      <div className="bg-grey-00 border-grey-10 flex min-w-60 flex-col overflow-hidden rounded border drop-shadow-md">
        <p className="text-l bg-grey-02 border-b-grey-10 border-b p-4 font-semibold">
          {t('data:view_pivot.title')}
        </p>

        <div className="flex flex-col gap-4 rounded p-4">
          {selectedPivotInfo ? (
            <div className="grid grid-cols-[max-content_max-content] items-center gap-x-3 gap-y-1">
              <span className="text-grey-50 text-s">
                {t('data:view_pivot.table')}:
              </span>
              <span className="text-m text-grey-100">
                {selectedPivotInfo.tableName}
              </span>

              <span className="text-grey-50 text-s">
                {t('data:view_pivot.value')}:
              </span>
              <span className="text-m text-grey-100">
                {selectedPivotInfo.displayedPath}
              </span>
            </div>
          ) : null}

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
