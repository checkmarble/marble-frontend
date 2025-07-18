import {
  UploadFile,
  UploadFileContentProps,
} from '@app-builder/routes/ressources+/files+/upload-file';

export function AddYourFirstFile({
  children,
  uploadFileEndpoint,
}: {
  children?: React.ReactNode;
  uploadFileEndpoint: UploadFileContentProps['uploadFileEndpoint'];
}) {
  return (
    <UploadFile uploadFileEndpoint={uploadFileEndpoint}>
      <button className="hover:text-purple-65 text-purple-82 hover:underline">{children}</button>
    </UploadFile>
  );
}
