import { type TableModel } from '@app-builder/models';
import { reorder } from '@app-builder/utils/list';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { toggle } from 'radash';
import { type KeyboardEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, ScrollAreaV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { type ColumnPrefs } from './column-prefs';

export function ColumnSettingsPanel({
  table,
  prefs,
  onValidate,
  onClose,
}: {
  table: TableModel;
  prefs: ColumnPrefs;
  onValidate: (prefs: ColumnPrefs) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  // Draft never resyncs with `prefs`: mount this card only while it is open.
  const [draft, setDraft] = useState(prefs);

  const labels = new Map(table.fields.map((field) => [field.name, field.alias || field.name]));
  const otherFields = table.fields.filter((field) => !draft.visible.includes(field.name));

  const move = (from: number, to: number) => setDraft((d) => ({ ...d, visible: reorder(d.visible, from, to) }));

  const handleDragEnd = (result: DropResult) => {
    if (result.destination) move(result.source.index, result.destination.index);
  };

  const handleHandleKeyDown = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    // defaultPrevented: the dnd keyboard sensor already owns the arrows while a row is lifted
    if (e.defaultPrevented || !(e.metaKey || e.ctrlKey)) return;
    const to = e.key === 'ArrowUp' ? index - 1 : e.key === 'ArrowDown' ? index + 1 : -1;
    if (to < 0 || to >= draft.visible.length) return;
    e.preventDefault();
    move(index, to);
    // The row is keyed by column name, so the same node moves: give it focus back.
    const handle = e.currentTarget;
    setTimeout(() => handle.focus(), 0);
  };

  return (
    <section
      aria-label={t('cases:data_explorer.column_settings.title')}
      className="flex min-h-0 w-90 shrink-0 flex-col gap-md self-stretch rounded-md border border-grey-border bg-surface-card p-md shadow-md"
    >
      <div className="flex shrink-0 items-center gap-sm">
        <Button
          variant="secondary"
          appearance="link"
          mode="icon"
          className="shrink-0"
          aria-label={t('common:close')}
          onClick={onClose}
        >
          <Icon icon="x" className="size-6" />
        </Button>
        <span className="truncate text-default font-medium">{t('cases:data_explorer.column_settings.title')}</span>
      </div>

      <ScrollAreaV2 className="min-h-0 flex-1">
        <div className="flex flex-col gap-md ps-xs pe-sm">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="column-settings-visible">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="flex flex-col gap-sm">
                  {draft.visible.map((name, index) => {
                    const label = labels.get(name) ?? name;
                    const isPinned = draft.pinned.includes(name);
                    return (
                      <Draggable key={name} draggableId={name} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            className={cn('flex h-8 items-center gap-sm', snapshot.isDragging && 'opacity-80')}
                          >
                            {/* Not a <button>: dnd refuses to start a drag from interactive tags. It sets role="button" and tabIndex. */}
                            <div
                              {...dragProvided.dragHandleProps}
                              aria-label={label}
                              onKeyDown={(e) => handleHandleKeyDown(e, index)}
                              className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded-sm text-purple-primary outline-purple-primary outline-offset-2 focus-visible:outline-2"
                            >
                              <Icon icon="unfold_more" className="size-4" />
                            </div>
                            <div className="flex min-w-0 flex-1 items-center gap-sm self-stretch rounded-md bg-purple-background-light ps-sm pe-xs">
                              <span className="flex-1 truncate text-small font-medium">{label}</span>
                              <Button
                                variant="secondary"
                                appearance="link"
                                mode="icon"
                                className="shrink-0"
                                aria-label={t('cases:data_explorer.column_settings.hide_column')}
                                onClick={() =>
                                  setDraft((d) => ({
                                    visible: d.visible.filter((n) => n !== name),
                                    pinned: d.pinned.filter((n) => n !== name),
                                  }))
                                }
                              >
                                <Icon icon="eye-slash" className="size-4" />
                              </Button>
                            </div>
                            <Button
                              variant={isPinned ? 'primary' : 'secondary'}
                              appearance="link"
                              mode="icon"
                              className="shrink-0"
                              aria-label={t(
                                isPinned ? 'cases:data_explorer.unpin_column' : 'cases:data_explorer.pin_column',
                              )}
                              onClick={() => setDraft((d) => ({ ...d, pinned: toggle(d.pinned, name) }))}
                            >
                              <Icon icon={isPinned ? 'pin' : 'pin-outline'} className="size-4" />
                            </Button>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {otherFields.length > 0 ? (
            <div className="flex flex-col gap-sm">
              <p className="flex items-center gap-xs text-small text-grey-secondary">
                {t('cases:data_explorer.column_settings.other_columns')}
                <span aria-hidden className="h-px flex-1 bg-grey-border" />
              </p>
              <ul>
                {otherFields.map((field) => (
                  <li key={field.name} className="flex h-8 items-center gap-sm">
                    <span className="flex-1 truncate text-small font-medium">{field.alias || field.name}</span>
                    <Button
                      variant="primary"
                      appearance="link"
                      mode="icon"
                      className="shrink-0"
                      aria-label={t('cases:data_explorer.column_settings.add_column')}
                      onClick={() => setDraft((d) => ({ ...d, visible: [...d.visible, field.name] }))}
                    >
                      <Icon icon="plus" className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </ScrollAreaV2>

      <div className="flex shrink-0 justify-end gap-sm">
        <Button variant="secondary" onClick={onClose}>
          {t('common:cancel')}
        </Button>
        <Button
          variant="primary"
          disabled={draft.visible.length === 0}
          onClick={() => {
            onValidate(draft);
            onClose();
          }}
        >
          {t('common:validate')}
        </Button>
      </div>
    </section>
  );
}
