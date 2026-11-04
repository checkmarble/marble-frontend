import type { TracfinContextRoot } from '@app-builder/models/tracfin';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { useRecordCaption } from './useRecordCaption';

/** A record of the client base: its caption when the table has one, then `table · id`. */
export function RecordLabel({ table, recordId }: { table: string; recordId: string }) {
  const caption = useRecordCaption(table, recordId);
  return (
    <span className="flex min-w-0 flex-wrap items-baseline gap-x-xs">
      {caption ? <span className="font-medium">{caption}</span> : null}
      <span className="text-grey-secondary font-mono text-xs break-all">
        {table} · {recordId}
      </span>
    </span>
  );
}

/** Why a record is in the context of the case: the entity of the case, the pivot of a decision, or both. */
export function RootOrigins({ origins }: { origins: TracfinContextRoot['origins'] }) {
  const { t } = useTranslation(['tracfin']);
  return (
    <span className="flex flex-wrap gap-xs">
      {origins.map((origin) => (
        <Tag key={origin} size="xs" color="grey">
          {t(`tracfin:draft.persons.origins.${origin}`)}
        </Tag>
      ))}
    </span>
  );
}
