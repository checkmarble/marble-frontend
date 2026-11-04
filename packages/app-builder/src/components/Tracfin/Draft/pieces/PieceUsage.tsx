import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { fieldLabel } from '../fields/labels';
import { personDisplayName } from '../persons/display-name';
import { groupUsagesByPerson, piecesReferencing } from './pieces-model';

/** Who references this piece, read from the document: the declared persons whose fields point to it. */
export function PieceUsage({ pieceId }: { pieceId: string }) {
  const { t } = useTranslation(['tracfin']);
  const { draft, catalogIndex } = useTracfinDraftEditorContext();
  const groups = groupUsagesByPerson(piecesReferencing(draft.document.root, pieceId));

  if (groups.length === 0) {
    return (
      <p className="text-grey-secondary text-xs">
        {t('tracfin:draft.pieces.usage.none', { section: t('tracfin:draft.sections.persons') })}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2xs">
      <p className="text-s font-medium">{t('tracfin:draft.pieces.usage.title')}</p>
      <ul className="text-s flex list-disc flex-col gap-2xs pl-md">
        {groups.map((group, index) => {
          const name = group.person
            ? (personDisplayName(group.person.block, group.person.kind) ?? t('tracfin:draft.persons.unnamed'))
            : t('tracfin:draft.pieces.usage.elsewhere');
          const where = group.usages
            .map((usage) => {
              const field = catalogIndex.field(usage.fieldId);
              return field ? fieldLabel(t, field) : usage.fieldId;
            })
            .join(', ');
          return (
            <li key={group.person?.block.id ?? `elsewhere-${index}`}>
              <span className="font-medium">{name}</span> — {where}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
