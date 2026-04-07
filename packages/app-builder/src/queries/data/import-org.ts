import { importOrgFileFn, importOrgFn } from '@app-builder/server-fns/data';
import { useMutation } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';

export const useImportOrgFromFileMutation = () => {
  const importOrgFile = useServerFn(importOrgFileFn);

  return useMutation({
    mutationKey: ['data', 'import-org-file'],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return importOrgFile({ data: formData });
    },
  });
};

export const useImportOrgMutation = () => {
  const importOrg = useServerFn(importOrgFn);

  return useMutation({
    mutationKey: ['data', 'import-org'],
    mutationFn: async (fileContent: unknown) => importOrg({ data: { body: fileContent } }),
  });
};
