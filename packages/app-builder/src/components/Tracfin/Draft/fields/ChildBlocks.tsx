import type { TracfinCatalogField } from '@app-builder/models/tracfin';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ConfirmDialog } from '../ConfirmDialog';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { blockAddress, singletonChildAddress, type TracfinBlockAddress } from '../model/block-address';
import { blockLabel } from './labels';
import { TracfinBlockEditor } from './TracfinBlockEditor';

function BlockCard({
  title,
  badge,
  onRemove,
  removeLabel,
  children,
}: {
  title: string;
  badge?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  children: ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className="border-grey-border bg-surface-card flex min-w-0 flex-col gap-md rounded-lg border p-md"
    >
      <header className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-xs">
          <h4 className="text-default font-semibold">{title}</h4>
          {badge}
        </div>
        {onRemove ? (
          <Button variant="secondary" appearance="link" size="small" onClick={onRemove}>
            <Icon icon="delete" className="size-4" />
            {removeLabel}
          </Button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

/**
 * The instances of one child block of a block, within the catalog cardinality:
 * - a single block that exists is edited in place (and removable when the catalog does not expect it);
 * - a single block that does not exist yet is edited as if it did (the first value creates it) when
 *   the catalog expects it, otherwise it opens with « Renseigner »;
 * - repeatable blocks are a list with « Ajouter » up to the maximum and a removal per instance.
 * Adding and removing are saved at once, together with the pending edits.
 */
export function ChildBlocks({ parent, child }: { parent: TracfinBlockAddress; child: TracfinCatalogField }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const cardinality = editor.catalogIndex.cardinality(child.id) ?? { min: 0, max: 1 };
  const parentBlock = editor.blockAt(parent);
  const instances = (parentBlock?.children ?? []).filter((candidate) => candidate.catalog_id === child.id);
  const title = blockLabel(t, child);
  const removable = cardinality.min === 0 || instances.length > (cardinality.min ?? 0);

  const removeDialog = (
    <ConfirmDialog
      open={removing !== null}
      onOpenChange={(open) => !open && setRemoving(null)}
      title={t('tracfin:draft.remove_block.title', { block: title })}
      description={t('tracfin:draft.remove_block.description')}
      confirmLabel={t('tracfin:draft.remove_block.confirm')}
      destructive
      onConfirm={() => removing && void editor.removeBlock(removing)}
    />
  );

  if (cardinality.max === 1) {
    const instance = instances[0];
    if (instance) {
      return (
        <>
          <BlockCard
            title={title}
            onRemove={removable ? () => setRemoving(instance.id) : undefined}
            removeLabel={t('tracfin:draft.remove_block.action')}
          >
            <TracfinBlockEditor address={blockAddress(instance.id)} catalogId={child.id} />
          </BlockCard>
          {removeDialog}
        </>
      );
    }
    const address = singletonChildAddress(editor.draft.document.root, parent, child.id);
    if (cardinality.min >= 1 || isOpen) {
      return (
        <BlockCard title={title}>
          <TracfinBlockEditor address={address} catalogId={child.id} />
        </BlockCard>
      );
    }
    return (
      <BlockCard
        title={title}
        badge={
          <Tag size="xs" color="grey">
            {t('tracfin:draft.optional_block')}
          </Tag>
        }
      >
        <Button
          variant="secondary"
          appearance="stroked"
          size="small"
          className="self-start"
          onClick={() => setIsOpen(true)}
        >
          {t('tracfin:draft.fill_block', { block: title })}
        </Button>
      </BlockCard>
    );
  }

  const atMaximum = cardinality.max !== null && instances.length >= cardinality.max;
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-sm">
      <div className="flex flex-wrap items-center gap-xs">
        <h4 className="text-default font-semibold">{title}</h4>
        <span className="text-grey-secondary text-xs">
          {t('tracfin:draft.occurrences', { count: instances.length, max: cardinality.max ?? '∞' })}
        </span>
        {cardinality.min >= 1 && instances.length < cardinality.min ? (
          <Tag size="xs" color="orange">
            {t('tracfin:draft.expected_by_tracfin')}
          </Tag>
        ) : null}
      </div>
      {instances.map((instance, index) => (
        <BlockCard
          key={instance.id}
          title={t('tracfin:draft.block_instance', { block: title, index: index + 1 })}
          onRemove={removable ? () => setRemoving(instance.id) : undefined}
          removeLabel={t('tracfin:draft.remove_block.action')}
        >
          <TracfinBlockEditor address={blockAddress(instance.id)} catalogId={child.id} />
        </BlockCard>
      ))}
      <Button
        variant="secondary"
        appearance="stroked"
        size="small"
        className="self-start"
        disabled={atMaximum || isAdding}
        onClick={async () => {
          setIsAdding(true);
          try {
            await editor.addBlock(parent, child.id);
          } finally {
            setIsAdding(false);
          }
        }}
      >
        <Icon icon="plus" className="size-4" />
        {t('tracfin:draft.add_block', { block: title })}
      </Button>
      {removeDialog}
    </section>
  );
}
