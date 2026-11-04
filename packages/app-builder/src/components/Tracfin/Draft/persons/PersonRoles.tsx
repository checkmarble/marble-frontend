import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import type { PersonRole } from './roles';
import { usePersonNameOf } from './usePersonNames';

/** What a person is for the rest of the declaration: manager of an entity, issuer of an operation, end of a link... */
export function PersonRoles({ roles }: { roles: readonly PersonRole[] }) {
  const { t } = useTranslation(['tracfin']);
  const nameOf = usePersonNameOf();
  if (roles.length === 0) return null;
  return (
    <ul aria-label={t('tracfin:draft.persons.roles.title')} className="flex flex-wrap gap-xs">
      {roles.map((role) => (
        <li key={`${role.holderBlockId}:${role.fieldId}`}>
          <Tag size="small" color="white">
            {t(`tracfin:draft.persons.roles.${role.kind}`, {
              person: (role.holderPersonId ? nameOf(role.holderPersonId) : null) ?? t('tracfin:draft.persons.unnamed'),
            })}
          </Tag>
        </li>
      ))}
    </ul>
  );
}
