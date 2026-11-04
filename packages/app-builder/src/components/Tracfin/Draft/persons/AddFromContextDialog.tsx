import { useTracfinContextQuery } from '@app-builder/queries/tracfin/get-context';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { useTracfinDraftEditorContext } from '../editor/TracfinDraftEditorContext';
import { findIdentityMapping } from './add-person';
import { declaredPersons, personRoot } from './document';
import type { PersonKind } from './person-kinds';
import { RecordLabel, RootOrigins } from './RecordLabel';
import { draftMappings, rootKey } from './selection-model';

/**
 * Lists the records of the case (the roots of its context) to declare a person from. A root shows
 * what it is, why the case holds it (both reasons when both apply), and whether a mapping of the
 * configuration can fill the person from it.
 */
export function AddFromContextDialog({
  kind,
  open,
  onOpenChange,
  onChoose,
}: {
  kind: PersonKind;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoose: (root: { table: string; recordId: string }) => void;
}) {
  const { t } = useTranslation(['tracfin']);
  const { caseId, draft, catalogIndex } = useTracfinDraftEditorContext();
  const context = useTracfinContextQuery(caseId);
  const roots = context.data?.roots ?? [];
  const alreadyDeclared = new Set(
    declaredPersons(draft.document.root).flatMap(({ block }) => {
      const root = personRoot(block);
      return root ? [rootKey({ table: root.table, record_id: root.recordId })] : [];
    }),
  );

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="medium">
        <Modal.Title>{t(`tracfin:draft.persons.add_from_context_title.${kind}`)}</Modal.Title>
        <div className="flex flex-col gap-sm p-md">
          {context.isPending ? (
            <p className="text-grey-secondary text-s">{t('tracfin:draft.persons.context.loading')}</p>
          ) : context.isError ? (
            <p role="alert" className="text-s text-red-primary">
              {t('tracfin:draft.persons.context.load_failed')}
            </p>
          ) : roots.length === 0 ? (
            <p className="text-grey-secondary text-s">{t('tracfin:draft.persons.context.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-sm">
              {roots.map((root) => {
                const compatible = findIdentityMapping({
                  kind,
                  table: root.table,
                  mappings: draftMappings(draft),
                  catalogIndex,
                });
                return (
                  <li
                    key={rootKey(root)}
                    className="border-grey-border flex flex-wrap items-center justify-between gap-sm rounded-md border p-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-2xs">
                      <RecordLabel table={root.table} recordId={root.record_id} />
                      <RootOrigins origins={root.origins} />
                      <span className="text-grey-secondary text-xs">
                        {compatible
                          ? t('tracfin:draft.persons.context.will_attach')
                          : t('tracfin:draft.persons.context.no_mapping', { table: root.table })}
                        {alreadyDeclared.has(rootKey(root)) ? ` ${t('tracfin:draft.persons.context.already')}` : ''}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="small"
                      aria-label={t('tracfin:draft.persons.context.add_aria', {
                        table: root.table,
                        id: root.record_id,
                      })}
                      onClick={() => {
                        onOpenChange(false);
                        onChoose({ table: root.table, recordId: root.record_id });
                      }}
                    >
                      {t('tracfin:draft.persons.context.add')}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('tracfin:draft.persons.context.close')} />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
