import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress } from '../model/block-address';
import { personDisplayName } from './display-name';
import { personRoot } from './document';
import { PersonKindBadge } from './PersonKindBadge';
import { PersonRoles } from './PersonRoles';
import { type PersonKind, personCatalogId, relationNameOf, supportsContainerId } from './person-kinds';
import { RecordLabel } from './RecordLabel';
import { RelationsEditor } from './RelationsEditor';
import { RemoveBlockButton } from './RemoveBlockButton';
import type { PersonRole } from './roles';
import { SupportsEditor } from './SupportsEditor';

/**
 * A declared person: its name, where it comes from, the roles it plays elsewhere, and the whole
 * subtree to edit. Everything that references the person elsewhere points to this card's block.
 */
export function PersonCard({
  person,
  kind,
  roles,
}: {
  person: TracfinBlock;
  kind: PersonKind;
  roles: readonly PersonRole[];
}) {
  const { t } = useTranslation(['tracfin']);
  const name = personDisplayName(person, kind);
  const shownName = name ?? t('tracfin:draft.persons.unnamed');
  // A person that was just added has nothing to read yet: it opens on its fields.
  const [open, setOpen] = useState(name === null);
  const root = personRoot(person);

  const catalogId = personCatalogId(kind);
  const containerId = supportsContainerId(kind);
  // Supports and links have their own editors below the generic fields.
  const hasOwnEditor = (id: string) => id === containerId || relationNameOf(id) !== null;

  return (
    <section
      aria-label={shownName}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-sm rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <div className="flex min-w-0 flex-wrap items-center gap-xs">
          <PersonKindBadge kind={kind} />
          <h4 className="text-default truncate font-semibold">{shownName}</h4>
        </div>
        <div className="flex items-center gap-sm">
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? t('tracfin:draft.persons.collapse') : t('tracfin:draft.persons.open')}
          </Button>
          <RemoveBlockButton
            blockId={person.id}
            title={shownName}
            description={roles.length > 0 ? t('tracfin:draft.persons.remove_referenced') : undefined}
          />
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-xs">
        {root ? (
          <p className="text-s flex flex-wrap items-baseline gap-xs">
            <span className="text-grey-secondary">{t('tracfin:draft.persons.attached_to')}</span>
            <RecordLabel table={root.table} recordId={root.recordId} />
          </p>
        ) : (
          <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.entered_by_hand')}</p>
        )}
        <PersonRoles roles={roles} />
      </div>

      {open ? (
        <div className="flex min-w-0 flex-col gap-lg">
          <TracfinBlockEditor
            address={blockAddress(person.id)}
            catalogId={catalogId}
            include={(id) => !hasOwnEditor(id)}
          />
          <SupportsEditor person={person} kind={kind} />
          <RelationsEditor person={person} kind={kind} ownerName={shownName} />
        </div>
      ) : null}
    </section>
  );
}
