import { UploadFile, UploadFileContentProps } from './UploadFile';

export function AddYourFirstFile({
  children,
  uploadFileEndpoint,
}: {
  children?: React.ReactNode;
  uploadFileEndpoint: UploadFileContentProps['uploadFileEndpoint'];
}) {
  return (
    <UploadFile uploadFileEndpoint={uploadFileEndpoint}>
      <button className="hover:text-purple-primary text-purple-disabled hover:underline">{children}</button>
    </UploadFile>
  );
}
