import { useTranslation } from 'react-i18next';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import type { TracfinBlockAddress } from '../model/block-address';
import { BlockDiagnostics } from './BlockDiagnostics';
import { useTracfinBlockExtras } from './block-extras';
import { ChildBlocks } from './ChildBlocks';
import { ChoiceGroupEditor } from './ChoiceGroupEditor';
import { FieldEditor } from './FieldEditor';
import { blockLabel } from './labels';

type TracfinBlockEditorProps = {
  /** The block instance: an existing block, or the virtual address of a singleton the first edit will create. */
  address: TracfinBlockAddress;
  /** The catalog block it is an instance of. */
  catalogId: string;
  /** Restricts what is shown to some catalog ids (fields, attributes, child blocks). */
  include?: (catalogId: string) => boolean;
  /** Show the block title above its fields. */
  showTitle?: boolean;
};

/**
 * Edits any block of the catalog from the catalog alone: its scalar fields in catalog order, its
 * own attributes, its choices and its child blocks (added and removed within the cardinality).
 * `calculated` and `excluded` nodes are never rendered. What is expected by TRACFIN is flagged,
 * never enforced.
 */
export function TracfinBlockEditor({ address, catalogId, include, showTitle = false }: TracfinBlockEditorProps) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const { catalogIndex } = editor;
  const Extras = useTracfinBlockExtras();
  const contents = catalogIndex.fieldsOf(catalogId);
  const groups = catalogIndex.choiceGroups(catalogId);
  const inChoice = new Set(groups.flatMap((group) => group.members.map(({ field }) => field.id)));
  const wanted = (id: string) => !inChoice.has(id) && (include ? include(id) : true);

  const fields = [...contents.fields, ...contents.attributes].filter(
    ({ field, calculated }) => !calculated && wanted(field.id),
  );
  const blocks = contents.blocks.filter(({ field, calculated }) => !calculated && wanted(field.id));
  const catalogBlock = catalogIndex.field(catalogId);

  return (
    <div className="flex min-w-0 flex-col gap-md">
      {showTitle && catalogBlock ? <h3 className="text-default font-semibold">{blockLabel(t, catalogBlock)}</h3> : null}
      {Extras ? <Extras address={address} catalogId={catalogId} /> : null}
      <BlockDiagnostics blockId={address.kind === 'block' ? address.id : null} />
      {fields.map(({ field }) => (
        <FieldEditor key={field.id} address={address} field={field} />
      ))}
      {groups
        .filter((group) => group.members.some(({ field }) => !include || include(field.id)))
        .map((group) => (
          <ChoiceGroupEditor key={group.id} address={address} group={group} />
        ))}
      {blocks.map(({ field }) => (
        <ChildBlocks key={field.id} parent={address} child={field} />
      ))}
    </div>
  );
}
