import { CalloutV2 } from '@app-builder/components/Callout';
import { useTranslation } from 'react-i18next';
import type { TracfinSectionId } from '../model/sections';

/**
 * Stands in for a section that a later task builds. The section keeps its own file
 * (`PersonsSection.tsx`, ...): replacing the placeholder there does not touch the shell.
 */
export function SectionPlaceholder({ section }: { section: TracfinSectionId }) {
  const { t } = useTranslation(['tracfin']);
  return (
    <CalloutV2 role="status">
      <p>{t('tracfin:draft.placeholder', { section: t(`tracfin:draft.sections.${section}`) })}</p>
    </CalloutV2>
  );
}
