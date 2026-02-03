import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Spinner } from '../Spinner';

type TitleBarProps = {
  objectType: string;
  objectId: string;
};

export const TitleBar = ({ objectType, objectId }: TitleBarProps) => {
  const { t } = useTranslation(['common']);
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId);
  const { orgObjectTags } = useOrganizationObjectTags();

  return (
    <div className="flex gap-v2-md items-center">
      <div className="flex gap-v2-xs items-center">
        <h1 className="text-h1 font-semibold">Studio Nomade's informations</h1>
        <Tag color="grey">Companies</Tag>
      </div>
      <div className="w-px self-stretch bg-grey-border" />
      <div className="flex gap-v2-xs items-center">
        {match(annotationsQuery)
          .with({ isPending: true }, () => <Spinner className="size-4" />)
          .with({ isError: true }, () => (
            <>
              <span>{t('common:generic_fetch_data_error')}</span>
              <ButtonV2 variant="secondary" onClick={() => annotationsQuery.refetch()}>
                {t('common:retry')}
              </ButtonV2>
            </>
          ))
          .with({ isSuccess: true }, ({ data: { annotations } }) => {
            const tagAnnotations = annotations.tags;
            if (tagAnnotations.length === 0) {
              return null;
            }
            console.log(tagAnnotations);
            console.log(orgObjectTags);

            return tagAnnotations.map((tagAnnotation) => {
              const tag = orgObjectTags.find((t) => t.id === tagAnnotation.payload.tag_id);
              console.log('found', tag);
              if (!tag) return null;

              return <Tag key={tag.id}>{tag.name}</Tag>;
            });
          })
          .exhaustive()}
        <ButtonV2 variant="secondary" mode="icon">
          <Icon icon="edit-square" className="size-4" />
        </ButtonV2>
      </div>
      <div className="w-px self-stretch bg-grey-border" />
    </div>
  );
};
