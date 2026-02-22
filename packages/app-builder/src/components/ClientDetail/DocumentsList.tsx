import { User } from '@app-builder/models/user';
import { useGetCaseNameQuery } from '@app-builder/queries/cases/get-name';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useDownloadFile } from '@app-builder/services/DownloadFilesService';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { getFullName } from '@app-builder/services/user';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { formatDistanceToNow } from 'date-fns';
import { FileEntityAnnotationDto } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, CtaV2ClassName, useFormatLanguage } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelHeader, PanelRoot } from '../Panel';
import { Spinner } from '../Spinner';

type DocumentsListProps = {
  objectType: string;
  objectId: string;
};

type FileView = {
  annotation: FileEntityAnnotationDto;
  fileUrl: string;
};

export const DocumentsList = ({ objectType, objectId }: DocumentsListProps) => {
  const { t } = useTranslation(['common']);
  const annotationsQuery = useGetAnnotationsQuery(objectType, objectId, true);
  const users = useOrganizationUsers();
  const [currentFileView, setCurrentFileView] = useState<FileView | null>(null);

  return match(annotationsQuery)
    .with({ isPending: true }, () => (
      <div className="h-20 flex items-center justify-center col-span-full">
        <Spinner className="size-6" />
      </div>
    ))
    .with({ isError: true }, () => (
      <div className="h-20 flex items-center justify-center col-span-full">
        <span className="text-center">{t('common:generic_fetch_data_error')}</span>
        <Button variant="secondary" onClick={() => annotationsQuery.refetch()}>
          {t('common:retry')}
        </Button>
      </div>
    ))
    .with({ isSuccess: true }, ({ data: { annotations } }) => {
      const documents = annotations.files;
      if (documents.length === 0) {
        return (
          <div className="flex col-span-full">
            <span>{t('common:no_data_to_display')}</span>
          </div>
        );
      }

      return (
        <>
          {documents.map((document) => {
            const annotatedBy = users.getOrgUserById(document.annotated_by);

            return document.payload.files.map((file) => (
              <FileItem document={document} file={file} annotatedBy={annotatedBy} />
            ));
          })}
          {currentFileView ? (
            <PanelRoot open onOpenChange={() => setCurrentFileView(null)}>
              <PanelContainer size="xxl">
                <img src={currentFileView.fileUrl} />
              </PanelContainer>
            </PanelRoot>
          ) : null}
        </>
      );
    })
    .exhaustive();
};

const FileItem = ({
  document,
  file,
  annotatedBy,
}: {
  document: FileEntityAnnotationDto;
  file: FileEntityAnnotationDto['payload']['files'][number];
  annotatedBy: User | undefined;
}) => {
  const language = useFormatLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileEndpoint = getRoute('/ressources/annotations/download-file/:annotationId/:fileId', {
    annotationId: document.id,
    fileId: file.id,
  });
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(fileEndpoint, {});

  const fetchFile = async (endpoint: string) => {
    const response = await fetch(endpoint);
    if (response.ok) {
      return (await response.json()).url;
    }
    return null;
  };

  const onClickFile = async (
    annotation: FileEntityAnnotationDto,
    file: FileEntityAnnotationDto['payload']['files'][number],
  ) => {
    const fileEndpoint = getRoute('/ressources/annotations/download-file/:annotationId/:fileId', {
      annotationId: annotation.id,
      fileId: file.id,
    });

    const contentType = file.content_type;
    if (contentType?.startsWith('image/')) {
      const url = await fetchFile(fileEndpoint);
      if (!url) {
        return;
      }

      setPreviewUrl(url);
    } else {
      downloadCaseFile();
      return;
    }
  };

  return (
    <>
      <button
        key={file.id}
        className="flex gap-v2-sm items-center text-left cursor-pointer"
        onClick={() => onClickFile(document, file)}
        disabled={downloadingCaseFile}
      >
        <div
          className="size-20 border border-grey-border rounded-v2-s bg-cover shrink-0 relative bg-grey-background-light grid place-items-center"
          style={{ backgroundImage: file.thumbnail_url ? `url(${file.thumbnail_url})` : 'none' }}
        >
          {file.thumbnail_url && file.content_type !== 'text/plain' ? null : (
            <Icon icon="image-placeholder" className="size-4" />
          )}
          <div
            className={CtaV2ClassName({
              variant: 'secondary',
              mode: 'icon',
              className: 'absolute top-v2-xs right-v2-xs',
            })}
          >
            <Icon icon={file.content_type?.startsWith('image/') ? 'eye' : 'download'} className="size-3.5" />
          </div>
        </div>
        <div className="flex flex-col gap-v2-xs text-tiny text-grey-secondary truncate">
          <div className="font-medium text-default text-grey-primary truncate">{file.filename}</div>
          {document.case_id ? <CaseLink caseId={document.case_id} /> : null}
          <span>by @{annotatedBy ? getFullName(annotatedBy) : 'Unknown'}</span>
          <span>
            {formatDistanceToNow(new Date(document.created_at), {
              locale: getDateFnsLocale(language),
              addSuffix: true,
            })}
          </span>
        </div>
      </button>
      {previewUrl ? (
        <PanelRoot open onOpenChange={() => setPreviewUrl(null)}>
          <PanelContainer size="xxl">
            <PanelHeader>
              <div className="flex items-baseline gap-v2-md">
                <div>{file.filename}</div>
                <span className="text-default text-grey-secondary font-normal flex gap-v2-sm">
                  <span>
                    {formatDistanceToNow(new Date(document.created_at), {
                      locale: getDateFnsLocale(language),
                      addSuffix: true,
                    })}
                  </span>
                  <span>-</span>
                  <span>by @{annotatedBy ? getFullName(annotatedBy) : 'Unknown'}</span>
                </span>
              </div>
            </PanelHeader>
            <img src={previewUrl} />
          </PanelContainer>
        </PanelRoot>
      ) : null}
    </>
  );
};

const CaseLink = ({ caseId }: { caseId: string }) => {
  const link = getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseId) });
  const caseQuery = useGetCaseNameQuery(caseId);

  return (
    <Link to={link} className="text-purple-primary hover:text-purple-hover truncate">
      {caseQuery.isPending ? <Spinner className="size-4" /> : caseQuery.isSuccess ? caseQuery.data.name : 'Unknown'}
    </Link>
  );
};
