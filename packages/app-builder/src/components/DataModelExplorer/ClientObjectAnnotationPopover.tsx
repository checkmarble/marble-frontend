import {
  ClientCommentForm,
  ClientDocumentsPopover,
  ClientTagsEditSelect,
} from '@app-builder/routes/ressources+/data+/create-annotation';
import { useCallbackRef } from '@marble/shared';
import { useQueryClient } from '@tanstack/react-query';
import { type GroupedAnnotations } from 'marble-api';
import { type ReactNode, useState } from 'react';
import { Button, MenuCommand, Popover } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { ClientDocumentsList } from '../Annotations/ClientDocumentsList';
import { ClientTagsList } from '../Annotations/ClientTagsList';
import { ClientObjectComments } from './ClientObjectComments';

type ClientObjectAnnotationPopoverProps = {
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations | undefined;
};

export function ClientObjectAnnotationPopover({
  tableName,
  objectId,
  annotations,
}: ClientObjectAnnotationPopoverProps) {
  const queryClient = useQueryClient();
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const documents = annotations?.files ?? [];
  const tagsAnnotations = annotations?.tags ?? [];

  const handleAnnotateSuccess = useCallbackRef(() => {
    queryClient.invalidateQueries({ queryKey: ['resources', 'data-list-object', tableName] });
  });

  return (
    <div className="flex flex-col">
      <MenuCommand.Menu persistOnSelect open={editTagsOpen} onOpenChange={setEditTagsOpen}>
        <MenuCommand.Anchor>
          <AnnotationSection title="Tags">
            <div className="flex justify-between">
              <div>
                <ClientTagsList
                  tagsIds={tagsAnnotations.map((annotation) => annotation.payload.tag_id)}
                />
              </div>
              <MenuCommand.Trigger>
                <Button size="icon" variant="secondary">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </MenuCommand.Trigger>
              <MenuCommand.Content side="right" align="start" sideOffset={4} className="w-[340px]">
                <ClientTagsEditSelect
                  tableName={tableName}
                  objectId={objectId}
                  annotations={tagsAnnotations}
                  onAnnotateSuccess={() => {
                    handleAnnotateSuccess();
                    setEditTagsOpen(false);
                  }}
                />
              </MenuCommand.Content>
            </div>
          </AnnotationSection>
        </MenuCommand.Anchor>
      </MenuCommand.Menu>
      <div className="bg-grey-90 h-px" />
      <Popover.Root>
        <Popover.Anchor>
          <AnnotationSection title="Documents">
            <div className="flex justify-between">
              <div>
                <ClientDocumentsList documents={documents} />
              </div>
              <Popover.Trigger asChild>
                <Button size="icon" variant="secondary">
                  <Icon icon="edit-square" className="text-grey-50 size-4" />
                </Button>
              </Popover.Trigger>
              <Popover.Content
                side="right"
                align="start"
                sideOffset={4}
                collisionPadding={10}
                className="w-[340px]"
              >
                <ClientDocumentsPopover
                  tableName={tableName}
                  objectId={objectId}
                  documents={documents}
                  onAnnotateSuccess={handleAnnotateSuccess}
                />
              </Popover.Content>
            </div>
          </AnnotationSection>
        </Popover.Anchor>
      </Popover.Root>
      <div className="bg-grey-90 h-px" />
      <AnnotationSection title="Annotations">
        <ClientObjectComments comments={annotations?.comments ?? []} />
      </AnnotationSection>
      <div className="bg-grey-90 h-px" />
      <ClientCommentForm
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
      <div className="px-3 pb-1 pt-2 text-xs font-semibold">{title}</div>
      <div className="max-h-[400px] overflow-y-scroll px-4 pb-2 pt-1">{children}</div>
    </div>
  );
}
