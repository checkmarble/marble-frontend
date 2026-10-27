import { isTracfinRequestError } from '@app-builder/models/tracfin';
import { getTracfinCatalogIndex } from '@app-builder/models/tracfin/catalog-index';
import { useTracfinCatalogQuery } from '@app-builder/queries/tracfin/get-catalog';
import { useTracfinDraftQuery } from '@app-builder/queries/tracfin/get-draft';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { ErrorBanner } from '../Settings/ErrorBanner';
import { ConfigurationCard } from './ConfigurationCard';
import { CreateDraftPanel } from './CreateDraftPanel';
import { DraftHeader } from './DraftHeader';
import { DraftNotices } from './DraftNotices';
import { TracfinDraftEditorProvider, useTracfinDraftEditorContext } from './editor/TracfinDraftEditorContext';
import { LeaveGuard } from './LeaveGuard';
import type { TracfinSectionId } from './model/sections';
import { SectionNav } from './SectionNav';
import { tracfinSectionComponents } from './sections/section-components';

type TracfinDraftPageProps = {
  /** UUID of the case. */
  caseId: string;
  /** The section on screen: it is kept in the URL search params by the route. */
  section: TracfinSectionId;
  onSectionChange: (section: TracfinSectionId) => void;
};

/**
 * The TRACFIN draft of a case: creation when there is none, otherwise the sections around one shared
 * editor. Loads the catalog and the draft; a failure is shown as such, never as an empty draft.
 */
export function TracfinDraftPage({ caseId, section, onSectionChange }: TracfinDraftPageProps) {
  const { t } = useTranslation(['tracfin']);
  const catalogQuery = useTracfinCatalogQuery();
  const draftQuery = useTracfinDraftQuery(caseId);
  const catalogIndex = useMemo(
    () => (catalogQuery.data ? getTracfinCatalogIndex(catalogQuery.data.profile) : null),
    [catalogQuery.data],
  );

  const failed = [draftQuery, catalogQuery].find((query) => query.isError && query.data === undefined);
  if (failed) {
    const forbidden = isTracfinRequestError(failed.error) && failed.error.error.kind === 'forbidden';
    return (
      <ErrorBanner>
        <p className="font-semibold">
          {forbidden ? t('tracfin:draft.load_forbidden') : t('tracfin:draft.load_failed')}
        </p>
        {!forbidden && failed.error instanceof Error && failed.error.message ? (
          <p className="font-mono text-xs">{failed.error.message}</p>
        ) : null}
        {forbidden ? null : (
          <Button
            variant="secondary"
            appearance="stroked"
            className="self-start"
            onClick={() => {
              for (const query of [draftQuery, catalogQuery]) if (query.isError) void query.refetch();
            }}
          >
            {t('tracfin:draft.errors.retry')}
          </Button>
        )}
      </ErrorBanner>
    );
  }

  if (draftQuery.data === undefined || !catalogIndex) {
    return (
      <p className="text-s text-grey-secondary" role="status">
        {t('tracfin:draft.loading')}
      </p>
    );
  }

  if (draftQuery.data === null) return <CreateDraftPanel caseId={caseId} />;

  return (
    <TracfinDraftEditorProvider caseId={caseId} draft={draftQuery.data} catalogIndex={catalogIndex}>
      <TracfinDraftShell section={section} onSectionChange={onSectionChange} />
    </TracfinDraftEditorProvider>
  );
}

function TracfinDraftShell({ section, onSectionChange }: Pick<TracfinDraftPageProps, 'section' | 'onSectionChange'>) {
  const editor = useTracfinDraftEditorContext();
  const Section = tracfinSectionComponents[section];

  return (
    <div className="flex min-w-0 flex-col gap-lg">
      <DraftHeader />
      <DraftNotices />
      <ConfigurationCard />
      <div className="flex min-w-0 flex-col gap-lg lg:flex-row lg:items-start">
        <div className="lg:w-60 lg:shrink-0">
          <SectionNav
            section={section}
            onSectionChange={(next) => {
              // Leaving a section saves what was edited in it; the edits stay in the editor either way.
              void editor.autoFlush();
              onSectionChange(next);
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <Section />
        </div>
      </div>
      <LeaveGuard />
    </div>
  );
}
