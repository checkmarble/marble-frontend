import { LinksEditorContext } from '@app-builder/components/Data/shared/LinksEditorContext';
import { useDataModel } from '@app-builder/services/data/data-model';
import { useStore } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { LinkForm } from '../Shared/LinkForm';
import type { LinkValue } from '../Shared/semanticData-types';
import { useCreateTableFormContext } from './CreateTableContext';

export function CreateTableLinksStep({
  errorLinkIds,
  hasError,
}: {
  errorLinkIds?: ReadonlySet<string>;
  hasError?: boolean;
}) {
  const form = useCreateTableFormContext();
  const dataModel = useDataModel();
  const fields = useStore(form.store, (s) => s.values.fields);
  const links = useStore(form.store, (s) => s.values.links);

  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (links.length > 0) return;
    const inferred: LinkValue[] = fields
      .filter((f) => f.foreignkeyTable)
      .map((f) => {
        const savedTarget = dataModel.find((t) => t.name === f.foreignkeyTable);
        const targetTableId = savedTarget?.id ?? '';
        return {
          linkId: crypto.randomUUID(),
          name: f.foreignkeyTable!,
          tableFieldId: f.id,
          relationType: 'related' as const,
          targetTableId,
          sourceTableId: '',
        };
      });
    if (inferred.length > 0) form.setFieldValue('links', inferred);
  }, [fields, dataModel, form, links.length]);

  const destinationTableOptions = useMemo(
    () => [...dataModel.map((t) => ({ tableId: t.id, label: t.name }))],
    [dataModel],
  );

  const updateLink = useCallback(
    (linkId: string, values: Partial<LinkValue>) =>
      form.setFieldValue('links', (prev) => prev.map((l) => (l.linkId === linkId ? { ...l, ...values } : l))),
    [form],
  );

  const addLink = useCallback(
    () =>
      form.setFieldValue('links', (prev) => [
        ...prev,
        {
          linkId: crypto.randomUUID(),
          name: '',
          tableFieldId: '',
          relationType: 'related' as const,
          targetTableId: '',
          sourceTableId: '',
        },
      ]),
    [form],
  );

  const removeLink = useCallback(
    (linkId: string) => form.setFieldValue('links', (prev) => prev.filter((l) => l.linkId !== linkId)),
    [form],
  );

  const editorValue = useMemo(
    () => ({ links, sourceTableFields: fields, destinationTableOptions, updateLink, addLink, removeLink }),
    [links, fields, destinationTableOptions, updateLink, addLink, removeLink],
  );

  return (
    <LinksEditorContext.Provider value={editorValue}>
      <LinkForm errorLinkIds={errorLinkIds} hasError={hasError} />
    </LinksEditorContext.Provider>
  );
}
