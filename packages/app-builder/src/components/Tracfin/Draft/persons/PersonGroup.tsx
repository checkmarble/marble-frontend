import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { AddFromContextDialog } from './AddFromContextDialog';
import { planAddPerson } from './add-person';
import { personsOfKind } from './document';
import { PersonCard } from './PersonCard';
import { type PersonKind, personCatalogId } from './person-kinds';
import type { PersonRole } from './roles';

/**
 * The people of one kind (natural persons, legal entities, people not known to the bank), up to the
 * cardinality of the catalog. A person is added by hand, or from a record of the case's context for
 * natural persons and legal entities; a non-customer person never needs a record.
 */
export function PersonGroup({
  kind,
  rolesByPerson,
}: {
  kind: PersonKind;
  rolesByPerson: ReadonlyMap<string, readonly PersonRole[]>;
}) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [withoutSelection, setWithoutSelection] = useState<string | null>(null);

  const persons = personsOfKind(editor.draft.document.root, kind);
  const max = editor.catalogIndex.cardinality(personCatalogId(kind))?.max ?? null;
  const atMaximum = max !== null && persons.length >= max;
  const heading = t(`tracfin:draft.persons.kinds.${kind}`);

  const add = async (root?: { table: string; recordId: string }) => {
    setBusy(true);
    setWithoutSelection(null);
    try {
      const plan = planAddPerson({ draft: editor.draft, catalogIndex: editor.catalogIndex, kind, root });
      const result = await editor.applyStructural(plan.ops);
      if (result.ok && root && plan.selection === null) setWithoutSelection(root.table);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      aria-label={heading}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center gap-xs">
        <h3 className="text-default font-semibold">{heading}</h3>
        <span className="text-grey-secondary text-xs">
          {t('tracfin:draft.occurrences', { count: persons.length, max: max ?? '∞' })}
        </span>
      </header>
      <p className="text-grey-secondary text-xs">{t(`tracfin:draft.persons.kind_help.${kind}`)}</p>

      {persons.map((person) => (
        <PersonCard key={person.id} person={person} kind={kind} roles={rolesByPerson.get(person.id) ?? []} />
      ))}

      {withoutSelection ? (
        <p role="status" className="text-s text-orange-primary">
          {t('tracfin:draft.persons.added_without_selection', { table: withoutSelection })}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-sm">
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          disabled={atMaximum || busy}
          onClick={() => void add()}
        >
          <Icon icon="plus" className="size-4" />
          {t(`tracfin:draft.persons.add_manual.${kind}`)}
        </Button>
        {kind !== 'pnc' ? (
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            disabled={atMaximum || busy}
            onClick={() => setPicking(true)}
          >
            {t(`tracfin:draft.persons.add_from_context.${kind}`)}
          </Button>
        ) : null}
      </div>
      {atMaximum ? (
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.persons.at_maximum', { max })}</p>
      ) : null}

      {kind !== 'pnc' && picking ? (
        <AddFromContextDialog kind={kind} open onOpenChange={setPicking} onChoose={(root) => void add(root)} />
      ) : null}
    </section>
  );
}
