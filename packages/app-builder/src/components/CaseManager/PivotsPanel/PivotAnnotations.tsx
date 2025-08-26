import { ClientCommentForm } from '@app-builder/components/Annotations/ClientCommentForm';
import { ClientDocumentsList } from '@app-builder/components/Annotations/ClientDocumentsList';
import { ClientDocumentsPopover } from '@app-builder/components/Annotations/ClientDocumentsPopover';
import { ClientTagsEditSelect } from '@app-builder/components/Annotations/ClientTagsEditSelect';
import { ClientTagsList } from '@app-builder/components/Annotations/ClientTagsList';
import { ClientObjectComments } from '@app-builder/components/DataModelExplorer/ClientObjectComments';
import { type GroupedAnnotations } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';

type PivotAnnotationsProps = {
  caseId: string;
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations | undefined;
};

export function PivotAnnotations({
  caseId,
  tableName,
  objectId,
  annotations,
}: PivotAnnotationsProps) {
  const { t } = useTranslation(['common', 'cases']);
  const [commentSectionOpen, setCommentSectionOpen] = useState(true);
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const comments = annotations?.comments ?? [];
  const documents = annotations?.files ?? [];
  const tagsAnnotations = annotations?.tags ?? [];

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="text-h2 font-semibold">{t('cases:case_detail.pivot_panel.annotations')}</div>
      <div className="border-grey-90 flex flex-col gap-v2-md border p-v2-md bg-grey-background-light rounded-v2-lg">
        <div className="grid grid-cols-[116px_1fr] gap-x-3 gap-y-2">
          <div>{t('cases:annotations.tags.title')}</div>
          <div className="flex items-start justify-between">
            <div>
              <ClientTagsList
                tagsIds={tagsAnnotations.map((annotation) => annotation.payload.tag_id)}
              />
            </div>
            <MenuCommand.Menu persistOnSelect open={editTagsOpen} onOpenChange={setEditTagsOpen}>
              <MenuCommand.Trigger>
                <ButtonV2 type="button" mode="icon" variant="secondary">
                  <Icon icon="edit-square" className="size-3.5" />
                </ButtonV2>
              </MenuCommand.Trigger>
              <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="w-[340px]">
                <ClientTagsEditSelect
                  caseId={caseId}
                  tableName={tableName}
                  objectId={objectId}
                  annotations={tagsAnnotations}
                  onAnnotateSuccess={() => {
                    setEditTagsOpen(false);
                  }}
                />
              </MenuCommand.Content>
            </MenuCommand.Menu>
          </div>
          <div>{t('cases:annotations.documents.title')}</div>
          <div className="flex items-start justify-between">
            <div>
              <ClientDocumentsList documents={documents} />
            </div>
            <Popover.Root>
              <Popover.Trigger asChild>
                <ButtonV2 mode="icon" variant="secondary">
                  <Icon icon="edit-square" className="size-3.5" />
                </ButtonV2>
              </Popover.Trigger>
              <Popover.Content
                side="bottom"
                align="end"
                sideOffset={4}
                collisionPadding={10}
                className="w-[340px]"
              >
                <ClientDocumentsPopover
                  caseId={caseId}
                  documents={documents}
                  tableName={tableName}
                  objectId={objectId}
                />
              </Popover.Content>
            </Popover.Root>
          </div>
          <div
            data-open={commentSectionOpen}
            className="group/comment data-[open=true]:border-grey-90 col-span-full flex items-center justify-between pb-2 data-[open=true]:border-b"
          >
            {t('cases:annotations.comments.title')}
            <ButtonV2
              mode="icon"
              variant="secondary"
              onClick={() => setCommentSectionOpen((o) => !o)}
            >
              <Icon
                icon="caret-down"
                className="size-3.5 group-data-[open=true]/comment:rotate-180"
              />
            </ButtonV2>
          </div>
          {commentSectionOpen ? (
            <div className="col-span-full flex flex-col gap-4 pt-4">
              {comments.length > 0 ? (
                <ClientObjectComments comments={comments} className="mx-4" />
              ) : null}
              <ClientCommentForm
                caseId={caseId}
                tableName={tableName}
                objectId={objectId}
                className="border-grey-90 border"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
