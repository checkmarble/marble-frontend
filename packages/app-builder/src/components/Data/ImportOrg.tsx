import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useImportOrgMutation } from '@app-builder/queries/data/import-org';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function ImportOrg({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['data', 'common']);
  const importOrgMutation = useImportOrgMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revalidate = useLoaderRevalidator();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const text = await selectedFile.text();
    const json = JSON.parse(text);

    importOrgMutation.mutateAsync(json).then((result) => {
      revalidate();

      if (result.success) {
        setIsOpen(false);
        setSelectedFile(null);
      }
    });
  };

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      }}
    >
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('data:import_org.title')}</Modal.Title>
        <div className="flex flex-col gap-4 p-6">
          <p className="text-s text-grey-secondary">{t('data:import_org.description')}</p>
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
          <Button variant="secondary" appearance="stroked" onClick={() => fileInputRef.current?.click()}>
            <Icon icon="upload" className="size-5" />
            {selectedFile ? selectedFile.name : t('data:import_org.select_file')}
          </Button>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button variant="primary" disabled={!selectedFile || importOrgMutation.isPending} onClick={handleImport}>
            {importOrgMutation.isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
            {t('data:import_org.button_accept')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
