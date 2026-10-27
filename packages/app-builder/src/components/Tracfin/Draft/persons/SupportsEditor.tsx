import type { TracfinBlock } from '@app-builder/models/tracfin';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { TracfinBlockEditor } from '../fields/TracfinBlockEditor';
import { blockAddress, childrenOfCatalogId, singletonChildAddress } from '../model/block-address';
import { blockRef } from '../model/build-patch';
import { personRoot } from './document';
import { type PersonKind, type SupportType, supportCatalogId, supportsContainerId, supportTypes } from './person-kinds';
import { RemoveBlockButton } from './RemoveBlockButton';
import { draftMappings, mappingsOwnedBy } from './selection-model';
import { supportIdentifier } from './supports';
import { TracfinSelectionEditor } from './TracfinSelectionEditor';

/** The backend counts every kind of support of a person together against this limit (`FINANCIAL_REFERENCE_LIMIT`). */
const COMBINED_SUPPORT_LIMIT = 20;

function SupportTypeRow({ person, kind, type }: { person: TracfinBlock; kind: PersonKind; type: SupportType }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [fromClient, setFromClient] = useState(false);
  const [busy, setBusy] = useState(false);

  const catalogId = supportCatalogId(kind, type);
  const container = singletonChildAddress(
    editor.draft.document.root,
    blockAddress(person.id),
    supportsContainerId(kind),
  );
  const containerBlock = editor.blockAt(container);
  const instances = childrenOfCatalogId(containerBlock, catalogId);
  const max = editor.catalogIndex.cardinality(catalogId)?.max ?? null;
  const atMaximum = max !== null && instances.length >= max;
  const mappings = mappingsOwnedBy(draftMappings(editor.draft), editor.catalogIndex, catalogId);
  const typeLabel = t(`tracfin:draft.persons.support_types.${type}`);
  const fixedRoot = personRoot(person) ?? undefined;

  return (
    <li className="flex min-w-0 flex-col gap-xs">
      <div className="flex flex-wrap items-center gap-xs">
        <span className="text-s font-medium">{typeLabel}</span>
        <span className="text-grey-secondary text-xs">
          {t('tracfin:draft.occurrences', { count: instances.length, max: max ?? '∞' })}
        </span>
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          disabled={atMaximum || busy}
          aria-label={t('tracfin:draft.persons.supports.add_aria', { type: typeLabel })}
          onClick={async () => {
            setBusy(true);
            try {
              await editor.addBlock(container, catalogId);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Icon icon="plus" className="size-4" />
          {t('tracfin:draft.persons.supports.add_manual')}
        </Button>
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          disabled={atMaximum || mappings.length === 0}
          title={mappings.length === 0 ? t('tracfin:draft.persons.supports.no_mapping') : undefined}
          aria-label={t('tracfin:draft.persons.supports.from_client_aria', { type: typeLabel })}
          onClick={() => setFromClient(true)}
        >
          {t('tracfin:draft.persons.supports.from_client')}
        </Button>
      </div>

      {fromClient ? (
        <TracfinSelectionEditor
          mappings={mappings}
          fixedRoot={fixedRoot}
          save={(selection) =>
            editor.applyStructural([
              { type: 'add_block', parent: container, catalogId, ref: 'support' },
              { type: 'set_selection', block: blockRef('support'), selection },
            ])
          }
          onDone={() => setFromClient(false)}
          onCancel={() => setFromClient(false)}
        />
      ) : null}

      {instances.map((instance, index) => {
        const identifier = supportIdentifier(instance);
        const title = t('tracfin:draft.block_instance', { block: typeLabel, index: index + 1 });
        return (
          <section
            key={instance.id}
            aria-label={title}
            className="border-grey-border bg-surface-card ms-md flex min-w-0 flex-col gap-sm rounded-lg border p-md"
          >
            <header className="flex items-center justify-between gap-sm">
              <h5 className="text-s font-semibold">
                {typeLabel}
                {identifier ? <span className="text-grey-secondary ms-xs font-mono text-xs">{identifier}</span> : null}
              </h5>
              <RemoveBlockButton blockId={instance.id} title={title} />
            </header>
            <TracfinBlockEditor address={blockAddress(instance.id)} catalogId={catalogId} />
          </section>
        );
      })}
    </li>
  );
}

/**
 * The financial references (supports) of a person: the twelve types the XSD knows, each up to its
 * cardinality, added by hand or from the client base. The calculated `@id` of a support is never
 * shown; operations reference a support by its block.
 */
export function SupportsEditor({ person, kind }: { person: TracfinBlock; kind: PersonKind }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const container = editor.blockAt(
    singletonChildAddress(editor.draft.document.root, blockAddress(person.id), supportsContainerId(kind)),
  );
  const total = (container?.children ?? []).length;

  return (
    <section aria-label={t('tracfin:draft.persons.supports.title')} className="flex min-w-0 flex-col gap-sm">
      <div className="flex flex-wrap items-center gap-xs">
        <h4 className="text-default font-semibold">{t('tracfin:draft.persons.supports.title')}</h4>
        {total > COMBINED_SUPPORT_LIMIT ? (
          <Tag size="xs" color="red">
            {t('tracfin:draft.persons.supports.over_limit', { count: total, max: COMBINED_SUPPORT_LIMIT })}
          </Tag>
        ) : (
          <span className="text-grey-secondary text-xs">
            {t('tracfin:draft.persons.supports.combined', { count: total, max: COMBINED_SUPPORT_LIMIT })}
          </span>
        )}
      </div>
      <ul className="flex flex-col gap-sm">
        {supportTypes.map((type) => (
          <SupportTypeRow key={type} person={person} kind={kind} type={type} />
        ))}
      </ul>
    </section>
  );
}
