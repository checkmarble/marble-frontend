import type { TracfinPathStep, TracfinSelection } from '@app-builder/models/tracfin';
import { isTracfinRequestError } from '@app-builder/models/tracfin';
import { useTracfinNavigationQuery } from '@app-builder/queries/tracfin/navigate';
import { useTranslation } from 'react-i18next';
import { Button, Radio } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { isIndexUnavailable, summarizeRecord } from './record-summary';
import type { PathStepDefinition } from './selection-model';
import { useTableModel } from './useRecordCaption';

type NavigationStepPickerProps = {
  step: PathStepDefinition;
  /** The selection as it stands above this step: the root and the records chosen on the way here. */
  selection: TracfinSelection;
  /** The record chosen for this step, if any. */
  chosen: TracfinPathStep | undefined;
  onChoose: (recordId: string) => void;
  /** Un-chooses the step. */
  onClear: () => void;
};

/**
 * The candidates for one step of a selection, a page at a time. The list is never presented as
 * complete: as long as the server announces a next page, the list is marked partial and « Charger
 * plus » follows the cursor. A hop without a navigation index is said so, never shown as an empty list.
 */
export function NavigationStepPicker({ step, selection, chosen, onChoose, onClear }: NavigationStepPickerProps) {
  const { t } = useTranslation(['tracfin']);
  const { caseId } = useTracfinDraftEditorContext();
  const query = useTracfinNavigationQuery(caseId, selection, step.id);
  const model = useTableModel(step.table);

  const heading = (
    <p className="text-s font-medium">
      {step.table}
      <span className="text-grey-secondary ms-xs text-xs font-normal">
        {t(`tracfin:draft.persons.selection.direction.${step.direction ?? 'forward'}`, { link: step.link ?? '' })}
      </span>
    </p>
  );

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-xs">
        {heading}
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.selection.loading')}</p>
      </div>
    );
  }

  const firstPageFailed = query.isError && query.data === undefined;
  const notIndexed =
    (firstPageFailed && isTracfinRequestError(query.error) && query.error.error.kind === 'unprocessable') ||
    (query.data !== undefined && query.data.pages.some(isIndexUnavailable));
  if (notIndexed) {
    return (
      <div className="flex flex-col gap-xs">
        {heading}
        <p role="alert" className="text-s text-orange-primary">
          {t('tracfin:draft.persons.selection.not_indexed')}
        </p>
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.selection.not_indexed_help')}</p>
      </div>
    );
  }

  if (firstPageFailed) {
    return (
      <div className="flex flex-col gap-xs">
        {heading}
        <p role="alert" className="text-s text-red-primary">
          {t('tracfin:draft.persons.selection.load_failed')}
        </p>
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          onClick={() => void query.refetch()}
        >
          {t('tracfin:draft.errors.retry')}
        </Button>
      </div>
    );
  }

  if (query.data === undefined) return null;
  const objects = query.data.pages.flatMap((page) => page.objects);
  const loadedChosen = objects.some((object) => object.data['object_id'] === chosen?.record_id);

  return (
    <div className="flex flex-col gap-xs">
      {heading}
      {chosen?.record_id && !loadedChosen ? (
        <p className="text-s">
          {t('tracfin:draft.persons.selection.current_choice')}{' '}
          <span className="font-mono text-xs">{chosen.record_id}</span>
        </p>
      ) : null}
      {objects.length === 0 ? (
        <p className="text-grey-secondary text-s">{t('tracfin:draft.persons.selection.no_record')}</p>
      ) : (
        <Radio.Root
          aria-label={t('tracfin:draft.persons.selection.choose_in', { table: step.table })}
          size="small"
          value={chosen?.record_id ?? ''}
          onValueChange={onChoose}
          className="flex-col gap-xs"
        >
          {objects.map((object) => {
            const summary = summarizeRecord(object.data, {
              captionField: model?.captionField,
              fieldOrder: model?.fieldOrder,
            });
            return (
              <Radio.Item key={summary.recordId} value={summary.recordId}>
                <span className="flex min-w-0 flex-col">
                  <span className="text-s">
                    {summary.caption ? <span className="font-medium">{summary.caption} · </span> : null}
                    <span className="font-mono text-xs">{summary.recordId}</span>
                  </span>
                  {summary.fields.length > 0 ? (
                    <span className="text-grey-secondary text-xs">
                      {summary.fields.map((field) => `${field.name}: ${field.value}`).join(' · ')}
                    </span>
                  ) : null}
                </span>
              </Radio.Item>
            );
          })}
        </Radio.Root>
      )}
      {query.hasNextPage ? (
        <div className="flex flex-wrap items-center gap-sm">
          <span className="text-s text-orange-primary">
            {t('tracfin:draft.persons.selection.partial_list', { count: objects.length })}
          </span>
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {t('tracfin:draft.persons.selection.load_more')}
          </Button>
        </div>
      ) : objects.length > 0 ? (
        <p className="text-grey-secondary text-xs">
          {t('tracfin:draft.persons.selection.count', { count: objects.length })}
        </p>
      ) : null}
      {query.isFetchNextPageError ? (
        <p role="alert" className="text-s text-red-primary">
          {t('tracfin:draft.persons.selection.load_failed')}
        </p>
      ) : null}
      {chosen ? (
        <Button variant="secondary" appearance="link" size="small" className="self-start" onClick={onClear}>
          {t('tracfin:draft.persons.selection.clear_choice')}
        </Button>
      ) : null}
    </div>
  );
}
