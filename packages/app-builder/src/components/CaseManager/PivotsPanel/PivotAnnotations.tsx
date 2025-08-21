import { ClientCommentForm } from '@app-builder/components/Annotations/ClientCommentForm';
import { ClientDocumentsList } from '@app-builder/components/Annotations/ClientDocumentsList';
import { ClientDocumentsPopover } from '@app-builder/components/Annotations/ClientDocumentsPopover';
import { ClientTagsEditSelect } from '@app-builder/components/Annotations/ClientTagsEditSelect';
import { ClientTagsList } from '@app-builder/components/Annotations/ClientTagsList';
import { ClientObjectComments } from '@app-builder/components/DataModelExplorer/ClientObjectComments';
import { type GroupedAnnotations } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DataCard } from './DataCard';

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
    <DataCard title={t('cases:case_detail.pivot_panel.annotations')}>
      <div className="grid grid-cols-[116px_1fr] gap-x-3 gap-y-2 py-2">
        <div>{t('cases:annotations.tags.title')}</div>
        <div className="flex items-start justify-between">
          <div>
            <ClientTagsList
              tagsIds={tagsAnnotations.map((annotation) => annotation.payload.tag_id)}
            />
          </div>
          <MenuCommand.Menu persistOnSelect open={editTagsOpen} onOpenChange={setEditTagsOpen}>
            <MenuCommand.Trigger>
              <Button type="button" size="icon" variant="secondary">
                <Icon icon="edit-square" className="size-4" />
              </Button>
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
              <Button size="icon" variant="secondary">
                <Icon icon="edit-square" className="size-4" />
              </Button>
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
          <Button size="icon" variant="secondary" onClick={() => setCommentSectionOpen((o) => !o)}>
            <Icon icon="caret-down" className="size-4 group-data-[open=true]/comment:rotate-180" />
          </Button>
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
    </DataCard>
  );
}
