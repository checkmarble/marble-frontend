import {} from '@app-builder/components';
import { casesI18n } from '@app-builder/components/Cases';
import { type CaseDetail } from '@app-builder/models/cases';
import { useBackendInfo } from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { useNavigation, useRevalidator } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Attachment, Plus } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadFile({ caseDetail }: { caseDetail: CaseDetail }) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="w-fit whitespace-nowrap" variant="secondary">
          <Attachment className="text-l" />
          {t('cases:add_file')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <UploadFileContent caseDetail={caseDetail} setOpen={setOpen} />
      </Modal.Content>
    </Modal.Root>
  );
}

function toastError(error: string): void {
  toast(error, { icon: '❌' });
}

function UploadFileContent({
  caseDetail,
  setOpen,
}: {
  caseDetail: CaseDetail;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(handle.i18n);
  const [loading, setLoading] = useState(false);
  const revalidator = useRevalidator();

  const { accessToken, backendUrl } = useBackendInfo(
    clientServices.authenticationClientService,
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      void onDrop(acceptedFiles);
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/msword': ['.doc', '.docx'],
      'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/*': ['.csv', '.txt'],
    },
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length < 1) {
      toast.error('Please select a file');
      // toastError(
      //   `Please select a file of an accepted type and of size less than ${MAX_FILE_SIZE_MB} MB`,
      // );
      return;
    }
    const file = acceptedFiles[0];
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${backendUrl}/cases/${caseDetail.id}/files`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${await accessToken()}`,
          },
        },
      );
      if (!response.ok) {
        Sentry.captureException(await response.text());
        toastError('An error occurred while trying to upload the file.');
        return;
      }

      setLoading(false);
      setOpen(false);
    } catch (error) {
      Sentry.captureException(error);
      toastError('An error occurred while trying to upload the file.');
    } finally {
      setLoading(false);
    }
    revalidator.revalidate();
  };

  return (
    <div>
      <Modal.Title>{t('cases:inbox.new_inbox.explain')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-8 p-8">
        <div
          {...getRootProps()}
          className={clsx(
            'text-s flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
            isDragActive
              ? 'bg-purple-10 border-purple-50 opacity-90'
              : 'border-grey-50',
          )}
        >
          <input {...getInputProps()} />
          {loading ? <Loading className="border-none" /> : null}
          {!loading ? (
            <>
              <p className="text-center">{t('cases:drop_file_cta')}</p>
              <p>{t('cases:drop_file_accepted_types')}</p>
              <p className="text-grey-25 uppercase">{t('common:or')}</p>
              <Button>
                <Plus height="24px" width="24px" />
                {t('cases:pick_file_cta')}
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const Loading = ({ className }: { className?: string }) => {
  const { t } = useTranslation(handle.i18n);
  return (
    <div
      className={clsx(
        className,
        'border-grey-50 flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
      )}
    >
      {t('common:loading')}
    </div>
  );
};
