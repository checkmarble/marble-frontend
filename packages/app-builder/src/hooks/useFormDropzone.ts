import { useCallbackRef } from '@marble/shared';
import { type DropEvent, type FileRejection, useDropzone } from 'react-dropzone-esm';

type OnDropFn = <T extends File>(
  acceptedFiles: T[],
  fileRejections: FileRejection[],
  event: DropEvent,
) => void;

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const DEFAULT_ACCEPT = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
  'application/msword': ['.doc', '.docx'],
  'application/vnd.openxmlformats-officedocument.*': ['.docx', '.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/*': ['.csv', '.txt'],
};

type UseFormDropzoneOptions = {
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  onDrop: OnDropFn;
};

export function useFormDropzone({
  accept = DEFAULT_ACCEPT,
  maxSize = MAX_FILE_SIZE,
  multiple = true,
  onDrop: _onDrop,
}: UseFormDropzoneOptions) {
  const onDrop = useCallbackRef(_onDrop);
  return useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  });
}
