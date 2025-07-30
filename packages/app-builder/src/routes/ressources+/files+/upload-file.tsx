import { useNavigation, useRevalidator } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export function UploadFile({
  uploadFileEndpoint,
  children,
}: {
  uploadFileEndpoint: UploadFileContentProps['uploadFileEndpoint'];
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content>
        <UploadFileContent uploadFileEndpoint={uploadFileEndpoint} setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

export type UploadFileContentProps = {
  uploadFileEndpoint: (formData: FormData) => Promise<Response>;
  setOpen: (open: boolean) => void;
};

function UploadFileContent({ uploadFileEndpoint, setOpen }: UploadFileContentProps) {
  const { t } = useTranslation(['common', 'cases']);
  const [loading, setLoading] = useState(false);
  const revalidator = useRevalidator();

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
    multiple: true,
    maxSize: MAX_FILE_SIZE,
  });

  const onDrop = async (acceptedFiles: File[]) => {
    if (!R.hasAtLeast(acceptedFiles, 1)) {
      toast.error('Please select a file');
      // toastError(
      //   `Please select a file of an accepted type and of size less than ${MAX_FILE_SIZE_MB} MB`,
      // );
      return;
    }
    try {
      setLoading(true);

      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append('file[]', file);
      });

      const response = await uploadFileEndpoint(formData);

      if (!response.ok) {
        Sentry.captureException(await response.text());
        toast.error('An error occurred while trying to upload the file.');
        return;
      }

      setLoading(false);
      setOpen(false);
    } catch (error) {
      Sentry.captureException(error);
      toast.error('An error occurred while trying to upload the file.');
    } finally {
      setLoading(false);
    }
    revalidator.revalidate();
  };

  return (
    <div>
      <ModalV2.Title>{t('cases:add_file')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <div
          {...getRootProps()}
          className={clsx(
            'text-s flex h-60 flex-col items-center justify-center gap-4 rounded border-2 border-dashed',
            isDragActive ? 'bg-purple-96 border-purple-82 opacity-90' : 'border-grey-50',
          )}
        >
          <input {...getInputProps()} />
          {loading ? <Loading className="border-none" /> : null}
          {!loading ? (
            <>
              <p className="text-center">{t('cases:drop_file_cta')}</p>
              <p>{t('cases:drop_file_accepted_types')}</p>
              <p className="text-grey-80 uppercase">{t('common:or')}</p>
              <Button>
                <Icon icon="plus" className="size-6" />
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
  const { t } = useTranslation(['common']);
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
