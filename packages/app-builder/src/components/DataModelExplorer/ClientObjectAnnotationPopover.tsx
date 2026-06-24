import { useCallbackRef } from '@marble/shared';
import { useQueryClient } from '@tanstack/react-query';
import { type GroupedAnnotations } from 'marble-api';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ClientCommentForm } from '../Annotations/ClientCommentForm';
import { ClientDocumentsList } from '../Annotations/ClientDocumentsList';
import { ClientDocumentsPopover } from '../Annotations/ClientDocumentsPopover';
import { ClientTagsEditSelect } from '../Annotations/ClientTagsEditSelect';
import { ClientTagsList } from '../Annotations/ClientTagsList';
import { ClientObjectComments } from './ClientObjectComments';

type ClientObjectAnnotationPopoverProps = {
  caseId?: string;
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations | undefined;
};

export function ClientObjectAnnotationPopover({
  caseId,
  tableName,
  objectId,
  annotations,
}: ClientObjectAnnotationPopoverProps) {
  const queryClient = useQueryClient();
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [editDocumentsOpen, setEditDocumentsOpen] = useState(false);
  const documents = annotations?.files ?? [];
  const tagsAnnotations = annotations?.tags ?? [];
  const { t } = useTranslation(['cases']);

  const handleAnnotateSuccess = useCallbackRef(() => {
    queryClient.invalidateQueries({ queryKey: ['resources', 'data-list-object', tableName] });
  });

  return (
    <div className="flex flex-col">
      <AnnotationSection title={t('cases:annotations.tags.title')}>
        <div className="flex justify-between">
          <div>
            <ClientTagsList tagsIds={tagsAnnotations.map((annotation) => annotation.payload.tag_id)} />
          </div>
          <MenuCommand.Menu persistOnSelect open={editTagsOpen} onOpenChange={setEditTagsOpen}>
            <MenuCommand.Trigger>
              <Button mode="icon" variant="secondary">
                <Icon icon="edit-square" className="text-grey-secondary size-3.5" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content side="right" align="start" sideOffset={4} collisionPadding={10} className="w-[340px]">
              <ClientTagsEditSelect
                caseId={caseId}
                tableName={tableName}
                objectId={objectId}
                annotations={tagsAnnotations}
                onAnnotateSuccess={() => {
                  handleAnnotateSuccess();
                  setEditTagsOpen(false);
                }}
              />
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      </AnnotationSection>
      <div className="bg-grey-border h-px" />
      <AnnotationSection title={t('cases:annotations.documents.title')}>
        <div className="flex justify-between">
          <div>
            <ClientDocumentsList documents={documents} />
          </div>
          <MenuCommand.Menu persistOnSelect open={editDocumentsOpen} onOpenChange={setEditDocumentsOpen}>
            <MenuCommand.Trigger>
              <Button mode="icon" variant="secondary">
                <Icon icon="edit-square" className="text-grey-secondary size-3.5" />
              </Button>
            </MenuCommand.Trigger>
            <MenuCommand.Content side="right" align="start" sideOffset={4} collisionPadding={10} className="w-[340px]">
              <ClientDocumentsPopover
                caseId={caseId}
                tableName={tableName}
                objectId={objectId}
                documents={documents}
                onAnnotateSuccess={() => {
                  handleAnnotateSuccess();
                  setEditDocumentsOpen(false);
                }}
              />
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      </AnnotationSection>
      <div className="bg-grey-border h-px" />
      <AnnotationSection title="Annotations">
        <ClientObjectComments comments={annotations?.comments ?? []} />
      </AnnotationSection>
      <div className="bg-grey-border h-px" />
      <ClientCommentForm
        caseId={caseId}
        tableName={tableName}
        objectId={objectId}
        onAnnotateSuccess={handleAnnotateSuccess}
      />
    </div>
  );
}

function AnnotationSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex shrink flex-col">
      <div className="px-md pb-xs pt-sm text-xs font-semibold">{title}</div>
      <div className="max-h-[400px] overflow-y-scroll px-md pb-sm pt-xs">{children}</div>
    </div>
  );
}
