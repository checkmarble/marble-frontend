import type { TracfinSelection } from '@app-builder/models/tracfin';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordLabel } from './RecordLabel';
import { selectionPathLabel } from './selection-model';

/** A saved selection as its path: the root record, then the record chosen at each step. */
export function SelectionSummary({ selection }: { selection: TracfinSelection }) {
  const { t } = useTranslation(['tracfin']);
  const steps = selectionPathLabel(selection);
  return (
    <p
      className="text-s flex min-w-0 flex-wrap items-baseline gap-xs"
      aria-label={t('tracfin:draft.persons.selection.path')}
    >
      {steps.map((step, index) => (
        <Fragment key={`${step.table}-${step.recordId}-${index}`}>
          {index > 0 ? <span aria-hidden>→</span> : null}
          <RecordLabel table={step.table} recordId={step.recordId} />
        </Fragment>
      ))}
    </p>
  );
}
