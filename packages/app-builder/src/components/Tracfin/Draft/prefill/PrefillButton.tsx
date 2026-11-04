import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import type { TracfinSectionId } from '../model/sections';
import { useTracfinPrefill } from './TracfinPrefillContext';

/** « Proposer des valeurs »: computes the proposals of the saved draft and opens the review panel. */
export function PrefillButton({ scope = null }: { scope?: TracfinSectionId | null }) {
  const { t } = useTranslation(['tracfin']);
  const prefill = useTracfinPrefill();
  return (
    <Button
      variant="secondary"
      appearance="stroked"
      disabled={prefill.status !== 'idle'}
      onClick={() => prefill.propose(scope)}
    >
      {t('tracfin:draft.prefill.propose')}
    </Button>
  );
}

/** The bar above a section: the same action, scoped to that section, and what the last result holds for it. */
export function SectionPrefillBar({ section }: { section: TracfinSectionId }) {
  const { t } = useTranslation(['tracfin']);
  const prefill = useTracfinPrefill();
  const groups = prefill.groups?.sections.find((entry) => entry.section === section)?.blocks ?? [];
  const clean = groups.reduce((sum, group) => sum + group.clean.length, 0);
  const conflicts = groups.reduce((sum, group) => sum + group.conflicts.length, 0);
  const hasResult = prefill.result !== null && !prefill.stale;
  return (
    <div className="mb-md flex flex-wrap items-center gap-sm">
      <PrefillButton scope={section} />
      {hasResult && clean + conflicts > 0 ? (
        <Button variant="secondary" appearance="link" onClick={() => prefill.openPanel(section)}>
          {t('tracfin:draft.prefill.section_summary', { clean, conflicts })}
        </Button>
      ) : null}
    </div>
  );
}
