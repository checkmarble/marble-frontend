import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ConfirmDialog } from '../ConfirmDialog';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress, childrenOfCatalogId } from '../model/block-address';
import { firstText } from './document';
import { hasPendingEditsOnLink, planInvertRelation, relationTargetId } from './invert-relation';
import { type PersonKind, type RelationBlockName, relationBlockNames, relationCatalogId } from './person-kinds';
import { RemoveBlockButton } from './RemoveBlockButton';
import { usePersonNameOf } from './usePersonNames';

/** The category of a link (« Lien familial »...), read from its first relation type; the code when the list is unavailable. */
function useRelationCategory(link: TracfinBlock): string | null {
  const { catalogIndex } = useTracfinDraftEditorContext();
  const typeId = `${link.catalog_id}/typeRelation`;
  const fieldId = `${typeId}/categorieRelation`;
  const code = firstText(childrenOfCatalogId(link, typeId)[0], fieldId);
  if (!code) return null;
  const codes = catalogIndex.codesFor(fieldId);
  return Array.isArray(codes) ? (codes.find((entry) => entry.value === code)?.label ?? code) : code;
}

/** « <owner> → <target> : <category> »: the direction of a link, always written out. */
function DirectionLine({ owner, target, category }: { owner: string; target: string | null; category: string | null }) {
  const { t } = useTranslation(['tracfin']);
  return (
    <p className="text-s" data-testid="relation-direction">
      <span className="font-medium">{owner}</span>
      <span aria-hidden> → </span>
      <span className="font-medium">{target ?? t('tracfin:draft.persons.relations.target_missing')}</span>
      {' : '}
      <span>{category ?? t('tracfin:draft.persons.relations.category_missing')}</span>
    </p>
  );
}

function DeclaredRelationCard({
  person,
  ownerName,
  link,
  title,
}: {
  person: TracfinBlock;
  ownerName: string;
  link: TracfinBlock;
  title: string;
}) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const nameOf = usePersonNameOf();
  const [inverting, setInverting] = useState(false);
  const category = useRelationCategory(link);
  const targetId = relationTargetId(link);
  const targetName = targetId ? nameOf(targetId) : null;
  const plan = targetId
    ? planInvertRelation({
        root: editor.draft.document.root,
        ownerId: person.id,
        linkId: link.id,
        catalogIndex: editor.catalogIndex,
      })
    : null;
  // The plan is read from the saved values: it waits for the edits of the link to be saved first.
  const unsaved = hasPendingEditsOnLink(link, editor.pendingEdits);
  const saving = editor.status === 'saving';

  return (
    <section
      aria-label={title}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-sm rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <DirectionLine owner={ownerName} target={targetName} category={category} />
        <div className="flex items-center gap-sm">
          <Button
            variant="secondary"
            appearance="stroked"
            size="small"
            disabled={!plan?.ok || unsaved || saving}
            onClick={() => setInverting(true)}
          >
            {t('tracfin:draft.persons.relations.invert')}
          </Button>
          <RemoveBlockButton blockId={link.id} title={title} />
        </div>
      </header>
      {unsaved && plan?.ok ? (
        <p className="text-grey-secondary text-xs" data-testid="relation-invert-hint">
          {t('tracfin:draft.persons.relations.invert_save_first')}
        </p>
      ) : null}
      <TracfinBlockEditor address={blockAddress(link.id)} catalogId={link.catalog_id} />
      <ConfirmDialog
        open={inverting}
        onOpenChange={setInverting}
        title={t('tracfin:draft.persons.relations.invert_title')}
        description={
          plan?.ok
            ? t('tracfin:draft.persons.relations.invert_description', {
                owner: ownerName,
                target: targetName ?? '',
              })
            : t(`tracfin:draft.persons.relations.invert_refused.${plan?.reason ?? 'no_target'}`)
        }
        confirmLabel={t('tracfin:draft.persons.relations.invert_confirm')}
        onConfirm={() => {
          if (plan?.ok) void editor.applyStructural(plan.ops);
        }}
      />
    </section>
  );
}

/** A link to a person who is not declared: free fields, with the same written-out direction. */
function FreeRelationCard({ ownerName, link, title }: { ownerName: string; link: TracfinBlock; title: string }) {
  const category = useRelationCategory(link);
  const base = link.catalog_id;
  const name =
    [firstText(link, `${base}/prenom`), firstText(link, `${base}/nom`)].filter(Boolean).join(' ') ||
    firstText(link, `${base}/denominationSociale`) ||
    null;
  return (
    <section
      aria-label={title}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-sm rounded-lg border p-md"
    >
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <DirectionLine owner={ownerName} target={name} category={category} />
        <RemoveBlockButton blockId={link.id} title={title} />
      </header>
      <TracfinBlockEditor address={blockAddress(link.id)} catalogId={link.catalog_id} />
    </section>
  );
}

function RelationList({
  person,
  kind,
  ownerName,
  name,
}: {
  person: TracfinBlock;
  kind: PersonKind;
  ownerName: string;
  name: RelationBlockName;
}) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [busy, setBusy] = useState(false);
  const catalogId = relationCatalogId(kind, name);
  const links = childrenOfCatalogId(person, catalogId);
  const max = editor.catalogIndex.cardinality(catalogId)?.max ?? null;
  const label = t(`tracfin:draft.persons.relations.kinds.${name}`);

  return (
    <div className="flex min-w-0 flex-col gap-sm">
      <div className="flex flex-wrap items-center gap-xs">
        <h5 className="text-s font-semibold">{label}</h5>
        <span className="text-grey-secondary text-xs">
          {t('tracfin:draft.occurrences', { count: links.length, max: max ?? '∞' })}
        </span>
      </div>
      {links.map((link, index) => {
        const title = t('tracfin:draft.block_instance', { block: label, index: index + 1 });
        return name === 'lienAutrePersonneDejaDeclaree' ? (
          <DeclaredRelationCard key={link.id} person={person} ownerName={ownerName} link={link} title={title} />
        ) : (
          <FreeRelationCard key={link.id} ownerName={ownerName} link={link} title={title} />
        );
      })}
      <Button
        variant="secondary"
        appearance="stroked"
        size="small"
        className="self-start"
        disabled={(max !== null && links.length >= max) || busy}
        onClick={async () => {
          setBusy(true);
          try {
            await editor.addBlock(blockAddress(person.id), catalogId);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Icon icon="plus" className="size-4" />
        {t(`tracfin:draft.persons.relations.add.${name}`)}
      </Button>
    </div>
  );
}

/**
 * The links of a person with other people. A link is written « <owner> → <target> : <category> » so
 * its direction is never ambiguous, and a link between two declared people can be turned around.
 * A person appears once in the declaration however many links point to it: links reference it.
 */
export function RelationsEditor({
  person,
  kind,
  ownerName,
}: {
  person: TracfinBlock;
  kind: PersonKind;
  ownerName: string;
}) {
  const { t } = useTranslation(['tracfin']);
  return (
    <section aria-label={t('tracfin:draft.persons.relations.title')} className="flex min-w-0 flex-col gap-md">
      <h4 className="text-default font-semibold">{t('tracfin:draft.persons.relations.title')}</h4>
      {relationBlockNames.map((name) => (
        <RelationList key={name} person={person} kind={kind} ownerName={ownerName} name={name} />
      ))}
    </section>
  );
}
