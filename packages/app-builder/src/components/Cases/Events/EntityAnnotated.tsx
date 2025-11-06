import { IngestedObjectDetailModal } from '@app-builder/components/Data/IngestedObjectDetailModal';
import { type EntityAnnotatedEvent } from '@app-builder/models/cases';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { type ReactNode, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Code } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from '../cases-i18n';
import { EventTime } from './Time';

type EntityAnnotatedProps = {
  event: EntityAnnotatedEvent;
};

const TagPreview = ({ name }: { name: string }) => (
  <div className="bg-purple-96 ms-2 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
  </div>
);

const ClickableCode = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => {
  return (
    <Code>
      <button onClick={onClick}>{children}</button>
    </Code>
  );
};

export function EntityAnnotated({ event }: EntityAnnotatedProps) {
  const { getOrgUserById } = useOrganizationUsers();
  const { getTagById } = useOrganizationObjectTags();
  const { t } = useTranslation(casesI18n);
  const [open, setOpen] = useState(false);

  const user = useMemo(() => (event.userId ? getOrgUserById(event.userId) : undefined), [event.userId, getOrgUserById]);

  return (
    <div key={event.id} className="flex w-full items-start gap-2">
      <div className="bg-grey-100 border-grey-90 flex size-6 shrink-0 grow-0 items-center justify-center rounded-full border">
        <Icon icon="comment" className="text-grey-00 size-3" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-grey-00 inline-flex h-full items-center whitespace-pre text-xs">
          <Trans
            t={t}
            i18nKey="case_detail.history.event_detail.entity_annotated"
            components={{
              Actor: <span className="font-bold capitalize" />,
              ObjectType: <ClickableCode onClick={() => setOpen(true)}>dummyChild</ClickableCode>,
              Type: <span className="font-bold" />,
            }}
            values={{
              actor: user ? getFullName(user) : 'Workflow',
              objectType: event.annotation.object_type,
              type: event.annotation.type,
            }}
          />
        </span>
        <span>
          {match(event.annotation)
            .with({ type: 'tag' }, (annotation) => {
              const tag = getTagById(annotation.payload.tag_id);
              return tag ? <TagPreview name={tag.name} /> : null;
            })
            .with({ type: 'file' }, (annotation) => {
              return (
                <span className="border-grey-90 ms-2 flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-xs font-medium">
                  {annotation.payload.files[0]?.filename}
                </span>
              );
            })
            .with({ type: 'comment' }, (annotation) => {
              return <span className="border-grey-90 ms-2 border-l ps-2">{annotation.payload.text}</span>;
            })
            .exhaustive()}
        </span>
        {open ? (
          <IngestedObjectDetailModal
            dataModel={[]}
            tableName={event.annotation.object_type}
            objectId={event.annotation.object_id}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </div>
      <EventTime time={event.createdAt} />
    </div>
  );
}
