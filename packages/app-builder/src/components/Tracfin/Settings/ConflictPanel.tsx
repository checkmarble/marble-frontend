import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { isDiffEmpty } from './configuration-diff';
import type { TracfinConflictComparison } from './useTracfinConfigurationEditor';

type ConflictPanelProps = {
  comparison: TracfinConflictComparison;
  onKeepLocalEdits: () => void;
  onTakeServerVersion: () => void;
};

function IdList({ title, ids }: { title: string; ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <div className="flex flex-col gap-2xs">
      <p className="text-s font-medium">{title}</p>
      <ul className="list-disc ps-md font-mono text-xs">
        {ids.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The server version set against the edits, at mapping id and setting field level. Re-applying the
 * edits is an explicit choice: nothing is overwritten before it.
 */
export function ConflictPanel({ comparison, onKeepLocalEdits, onTakeServerVersion }: ConflictPanelProps) {
  const { t } = useTranslation(['tracfin']);
  const { server, diff } = comparison;

  return (
    <section
      aria-labelledby="tracfin-conflict-title"
      className="border-grey-border bg-surface-card flex flex-col gap-md rounded-lg border p-md"
    >
      <div className="flex flex-col gap-xs">
        <h2 id="tracfin-conflict-title" className="text-default font-semibold">
          {t('tracfin:settings.conflict.title', { revision: server?.revision ?? 0 })}
        </h2>
        <p className="text-s text-grey-secondary">{t('tracfin:settings.conflict.description')}</p>
      </div>

      {isDiffEmpty(diff) ? (
        <p className="text-s">{t('tracfin:settings.conflict.identical')}</p>
      ) : (
        <div className="grid gap-md md:grid-cols-2">
          <div className="flex flex-col gap-sm">
            <p className="text-s font-semibold">{t('tracfin:settings.conflict.mappings')}</p>
            <IdList title={t('tracfin:settings.conflict.changed')} ids={diff.mappings.changed} />
            <IdList title={t('tracfin:settings.conflict.local_only')} ids={diff.mappings.localOnly} />
            <IdList title={t('tracfin:settings.conflict.server_only')} ids={diff.mappings.serverOnly} />
          </div>
          <div className="flex flex-col gap-sm">
            <p className="text-s font-semibold">{t('tracfin:settings.conflict.settings')}</p>
            <IdList title={t('tracfin:settings.conflict.changed')} ids={diff.settings.changed} />
            <IdList title={t('tracfin:settings.conflict.local_only')} ids={diff.settings.localOnly} />
            <IdList title={t('tracfin:settings.conflict.server_only')} ids={diff.settings.serverOnly} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-sm">
        <Button variant="primary" onClick={onKeepLocalEdits}>
          {t('tracfin:settings.conflict.keep_local')}
        </Button>
        <Button variant="secondary" appearance="stroked" onClick={onTakeServerVersion}>
          {t('tracfin:settings.conflict.take_server')}
        </Button>
      </div>
      <p className="text-grey-secondary text-xs">{t('tracfin:settings.conflict.keep_local_help')}</p>
    </section>
  );
}
