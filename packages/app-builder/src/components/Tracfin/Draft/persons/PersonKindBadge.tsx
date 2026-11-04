import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import type { PersonKind } from './person-kinds';

const COLORS = { pp: 'purple', pm: 'blue', pnc: 'orange' } as const;

/** « PP », « PM » or « PNC »: the kind of a declared person, the same everywhere it is shown. */
export function PersonKindBadge({ kind }: { kind: PersonKind }) {
  const { t } = useTranslation(['tracfin']);
  return (
    <Tag size="xs" color={COLORS[kind]} title={t(`tracfin:draft.persons.kinds.${kind}`)}>
      {t(`tracfin:draft.persons.kind_badge.${kind}`)}
    </Tag>
  );
}
