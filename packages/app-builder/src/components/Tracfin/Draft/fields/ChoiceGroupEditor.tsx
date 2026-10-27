import type { TracfinChoiceGroup } from '@app-builder/models/tracfin/catalog-index';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import type { TracfinBlockAddress } from '../model/block-address';
import { hasContent } from '../model/field-values';
import { ChildBlocks } from './ChildBlocks';
import { FieldEditor } from './FieldEditor';
import { blockLabel, fieldLabel } from './labels';

/**
 * A choice between alternatives of a block (for example « la personne dirigeante est identifiée par
 * une référence, ou par une personne physique, ou par une personne morale »). The server keeps the
 * data of the alternatives that are not active, and only exports the active one: the editor says so.
 */
export function ChoiceGroupEditor({ address, group }: { address: TracfinBlockAddress; group: TracfinChoiceGroup }) {
  const { t } = useTranslation(['tracfin']);
  const editor = useTracfinDraftEditorContext();
  const [picked, setPicked] = useState<string | null>(null);
  const block = editor.blockAt(address);

  const members = group.members.filter((entry) => !entry.calculated);
  const ids = members.map(({ field }) => field.id);
  const hasData = (memberId: string): boolean => {
    const member = members.find(({ field }) => field.id === memberId)?.field;
    if (!member) return false;
    if (member.kind === 'block') return (block?.children ?? []).some((child) => child.catalog_id === member.id);
    return editor
      .occurrences({ address, fieldId: member.id, single: false })
      .some((occurrence) => hasContent(occurrence.state));
  };

  const serverActive = block?.active_branches?.[group.id] ?? null;
  const selected =
    (picked && ids.includes(picked) ? picked : null) ??
    (serverActive && ids.includes(serverActive) ? serverActive : null) ??
    ids.find(hasData) ??
    null;
  const selectedEntry = members.find(({ field }) => field.id === selected)?.field;
  const othersHaveData = ids.some((id) => id !== selected && hasData(id));
  const switchedAway = serverActive !== null && selected !== null && selected !== serverActive;

  const labelOf = (field: NonNullable<typeof selectedEntry>) =>
    field.kind === 'block' ? blockLabel(t, field) : fieldLabel(t, field);

  return (
    <fieldset className="border-grey-border flex min-w-0 flex-col gap-sm rounded-lg border p-md">
      <legend className="text-s px-xs font-semibold">{t('tracfin:draft.choice.title')}</legend>
      <Radio.Root
        aria-label={t('tracfin:draft.choice.title')}
        size="small"
        value={selected ?? ''}
        onValueChange={setPicked}
        className="flex-row flex-wrap gap-md"
      >
        {members.map(({ field }) => (
          <Radio.Item key={field.id} value={field.id}>
            <span className="text-s">{labelOf(field)}</span>
            {field.id === serverActive ? (
              <span className="text-grey-secondary text-xs">({t('tracfin:draft.choice.exported')})</span>
            ) : null}
          </Radio.Item>
        ))}
      </Radio.Root>

      {selectedEntry ? (
        selectedEntry.kind === 'block' ? (
          <ChildBlocks parent={address} child={selectedEntry} />
        ) : (
          <FieldEditor address={address} field={selectedEntry} />
        )
      ) : (
        <p className="text-grey-secondary text-xs">{t('tracfin:draft.choice.none_selected')}</p>
      )}

      {othersHaveData ? <p className="text-grey-secondary text-xs">{t('tracfin:draft.choice.other_kept')}</p> : null}
      {switchedAway ? <p className="text-grey-secondary text-xs">{t('tracfin:draft.choice.switch_hint')}</p> : null}
    </fieldset>
  );
}
