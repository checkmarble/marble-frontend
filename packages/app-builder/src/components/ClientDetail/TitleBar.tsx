import { DataModelObject } from '@app-builder/models';
import { SCREENING_CATEGORY_COLORS } from '@app-builder/models/screening';
import { UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { Client360Table, GroupedAnnotations } from 'marble-api/generated/marblecore-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ClientRiskCategoriesEditSelect } from '../Annotations/ClientRiskCategoriesEditSelect';
import { ClientTagsEditSelect } from '../Annotations/ClientTagsEditSelect';
import { ClientTagsList } from '../Annotations/ClientTagsList';
import { Spinner } from '../Spinner';

type TitleBarProps = {
  objectType: string;
  objectId: string;
  objectDetails: DataModelObject;
  annotationsQuery: UseQueryResult<{ annotations: GroupedAnnotations }, Error>;
  metadata: Client360Table;
};

export const TitleBar = ({ objectType, objectId, objectDetails, annotationsQuery, metadata }: TitleBarProps) => {
  const { t } = useTranslation(['common']);
  const [editTagsOpen, setEditTagsOpen] = useState(false);
  const [editRiskCateogoriesOpen, setEditRiskCategoriesOpen] = useState(false);
  const queryClient = useQueryClient();

  return (
    <div className="flex gap-v2-md items-center">
      <div className="flex gap-v2-xs items-center">
        <h1 className="text-h1 font-semibold">{objectDetails.data[metadata.caption_field] as string}'s informations</h1>
        <Tag color="grey">{metadata.alias ?? metadata.name}</Tag>
      </div>
      <div className="w-px self-stretch bg-grey-border" />
      <div className="flex gap-v2-xs items-center">
        {match(annotationsQuery)
          .with({ isPending: true }, () => <Spinner className="size-4" />)
          .with({ isError: true }, () => (
            <>
              <span>{t('common:generic_fetch_data_error')}</span>
              <Button variant="secondary" onClick={() => annotationsQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </>
          ))
          .with({ isSuccess: true }, ({ data: { annotations } }) => {
            const tagsAnnotations = annotations.tags;

            return (
              <>
                {tagsAnnotations.length > 0 ? (
                  <div>
                    <ClientTagsList tagsIds={tagsAnnotations.map((annotation) => annotation.payload.tag_id)} />
                  </div>
                ) : (
                  <span className="text-grey-secondary text-small">{t('common:no_data_to_display')}</span>
                )}
                <MenuCommand.Menu persistOnSelect open={editTagsOpen} onOpenChange={setEditTagsOpen}>
                  <MenuCommand.Trigger>
                    <Button type="button" mode="icon" variant="secondary">
                      <Icon icon="edit-square" className="size-3.5" />
                    </Button>
                  </MenuCommand.Trigger>
                  <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="w-[340px]">
                    <ClientTagsEditSelect
                      tableName={objectType}
                      objectId={objectId}
                      annotations={tagsAnnotations}
                      onAnnotateSuccess={() => {
                        setEditTagsOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['annotations', objectType, objectId] });
                      }}
                    />
                  </MenuCommand.Content>
                </MenuCommand.Menu>
              </>
            );
          })
          .exhaustive()}
      </div>
      <div className="w-px self-stretch bg-grey-border" />
      <div className="flex gap-v2-xs items-center">
        {match(annotationsQuery)
          .with({ isPending: true }, () => <Spinner className="size-4" />)
          .with({ isError: true }, () => (
            <>
              <span>{t('common:generic_fetch_data_error')}</span>
              <Button variant="secondary" onClick={() => annotationsQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </>
          ))
          .with({ isSuccess: true }, ({ data: { annotations } }) => {
            const riskTopicsAnnotations = annotations.risk_tags;

            return (
              <>
                {riskTopicsAnnotations.length > 0 ? (
                  <div className="flex items-center gap-v2-sm">
                    {riskTopicsAnnotations.map((annotation) => (
                      <Tag color={SCREENING_CATEGORY_COLORS[annotation.payload.tag]}>{annotation.payload.tag}</Tag>
                    ))}
                  </div>
                ) : (
                  <span className="text-grey-secondary text-small">{t('common:no_data_to_display')}</span>
                )}
                <MenuCommand.Menu
                  persistOnSelect
                  open={editRiskCateogoriesOpen}
                  onOpenChange={setEditRiskCategoriesOpen}
                >
                  <MenuCommand.Trigger>
                    <Button type="button" mode="icon" variant="secondary">
                      <Icon icon="edit-square" className="size-3.5" />
                    </Button>
                  </MenuCommand.Trigger>
                  <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="w-[340px]">
                    <ClientRiskCategoriesEditSelect
                      tableName={objectType}
                      objectId={objectId}
                      annotations={riskTopicsAnnotations}
                      onAnnotateSuccess={() => {
                        setEditTagsOpen(false);
                        queryClient.invalidateQueries({ queryKey: ['annotations', objectType, objectId] });
                      }}
                    />
                  </MenuCommand.Content>
                </MenuCommand.Menu>
              </>
            );
          })
          .exhaustive()}
      </div>
    </div>
  );
};
