import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, CtaV2ClassName, useFormatLanguage } from 'ui-design-system';
import { Spinner } from '../Spinner';

type DocumentsListProps = {
  objectType: string;
  objectId: string;
};

export const DocumentsList = ({ objectType, objectId }: DocumentsListProps) => {
  const { t } = useTranslation(['common']);
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId);
  const users = useOrganizationUsers();
  const language = useFormatLanguage();

  return match(annotationsQuery)
    .with({ isPending: true }, () => (
      <div className="h-20 flex items-center justify-center">
        <Spinner className="size-6" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="h-20 flex items-center justify-center">
        <span className="text-center">{t('common:generic_fetch_data_error')}</span>
        <ButtonV2 variant="secondary" onClick={() => annotationsQuery.refetch()}>
          {t('common:retry')}
        </ButtonV2>
      </div>
    ))
    .with({ isSuccess: true }, ({ data: { annotations } }) => {
      const documents = annotations.files;
      if (documents.length === 0) {
        return (
          <div className="h-20 flex justify-center">
            <span className="text-center">{t('common:no_documents')}</span>
          </div>
        );
      }
      return documents.map((document) => {
        const annotatedBy = users.getOrgUserById(document.annotated_by);
        const caseLink = document.case_id
          ? getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(document.case_id) })
          : null;

        return document.payload.files.map((file) => (
          <div key={file.id} className="flex gap-v2-sm items-center">
            <div className="size-20 border border-grey-border rounded-v2-s" />
            <div className="flex flex-col gap-v2-xs text-tiny text-grey-secondary">
              <div className="font-medium text-default text-grey-primary">{file.filename}</div>
              {caseLink ? (
                <Link to={CtaV2ClassName({ variant: 'primary', appearance: 'link' })}>[Case name]</Link>
              ) : null}
              <span>by @{annotatedBy ? getFullName(annotatedBy) : 'Unknown'}</span>
              <span>
                {formatDistanceToNow(new Date(document.created_at), {
                  locale: getDateFnsLocale(language),
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        ));
      });
    })
    .exhaustive();
};
