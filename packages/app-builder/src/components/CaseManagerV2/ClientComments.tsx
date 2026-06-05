import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import * as Collapsible from '@radix-ui/react-collapsible';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { GroupedAnnotations } from 'marble-api';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Avatar, Card, Markdown } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ClientCommentForm as AnnotationClientCommentForm } from '../Annotations/ClientCommentForm';
import { EventTime } from '../Cases/Events/Time';
import { Spinner } from '../Spinner';

type ClientCommentsListProps = {
  annotationsQuery: UseQueryResult<{ annotations: GroupedAnnotations }, Error>;
};

function ClientCommentsList({ annotationsQuery }: ClientCommentsListProps) {
  const { t } = useTranslation(['common', 'cases']);
  const { getOrgUserById } = useOrganizationUsers();

  return match(annotationsQuery)
    .with({ isPending: true }, () => (
      <div className="flex justify-center">
        <Spinner className="size-6" />
      </div>
    ))
    .with({ isError: true }, () => {
      return (
        <div className="flex flex-col gap-v2-sm">
          <span>{t('common:global_error')}</span>
        </div>
      );
    })
    .with({ isSuccess: true }, ({ data }) => {
      const comments = data.annotations.comments;

      if (comments.length === 0) {
        return <div>{t('cases:manager.comments.empty')}</div>;
      }

      return (
        <div className="grid grid-cols-[1.5rem_1fr_minmax(auto,max-content)] gap-v2-sm max-h-100 overflow-y-auto">
          {comments.map((comment) => {
            const user = getOrgUserById(comment.annotated_by);

            return (
              <div key={comment.id} className="grid grid-cols-subgrid col-span-full">
                <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xxs" color="grey" />
                <span className="text-grey-primary whitespace-pre-wrap text-xs">
                  <Markdown>{comment.payload.text}</Markdown>
                </span>
                <EventTime time={comment.created_at} />
              </div>
            );
          })}
        </div>
      );
    })
    .exhaustive();
}

export function ClientCommentsListCard({ annotationsQuery }: ClientCommentsListProps) {
  return (
    <Card>
      <ClientCommentsList annotationsQuery={annotationsQuery} />
    </Card>
  );
}

type CommentFormProps = {
  annotationsQuery: UseQueryResult<{ annotations: GroupedAnnotations }, Error>;
  objectId: string;
  objectType: string;
};

export function ClientCommentForm({ annotationsQuery, objectId, objectType }: CommentFormProps) {
  const { t } = useTranslation(['cases']);
  const queryClient = useQueryClient();

  return (
    <div className="bg-surface-card border border-grey-border rounded-v2-md w-120 shadow-md">
      <div className="p-v2-md">
        <Collapsible.Root className="group/collapsible">
          <Collapsible.Trigger asChild>
            <button type="button" className="flex items-center gap-v2-sm group-radix-state-open/collapsible:pb-v2-sm">
              <Icon
                icon="arrow-up-right"
                className="size-4 transition-transform duration-200 rotate-270 group-radix-state-open/collapsible:rotate-90"
              />
              <span className="font-medium">{t('cases:manager.comments.investigations_header')}</span>
            </button>
          </Collapsible.Trigger>
          <Collapsible.Content className="overflow-hidden radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
            <ClientCommentsList annotationsQuery={annotationsQuery} />
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
      <div className="border-t border-grey-border">
        <AnnotationClientCommentForm
          tableName={objectType}
          objectId={objectId}
          onAnnotateSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['annotations', objectType, objectId] });
          }}
          className="rounded-t-none"
        />
      </div>
    </div>
  );
}
