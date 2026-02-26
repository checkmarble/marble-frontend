import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useImportOrgFromFileMutation, useImportOrgMutation } from '@app-builder/queries/data/import-org';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function ImportOrg({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['data', 'common']);
  const importFileMutation = useImportOrgFromFileMutation();
  const importBodyMutation = useImportOrgMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const revalidate = useLoaderRevalidator();

  const isPending = importFileMutation.isPending || importBodyMutation.isPending;

  const resetState = () => {
    setSelectedFile(null);
    setJsonContent('');
    setJsonError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileImport = () => {
    if (!selectedFile) return;
    importFileMutation.mutate(selectedFile, {
      onSuccess: (result) => {
        revalidate();
        if (result.success) {
          setIsOpen(false);
          resetState();
        }
      },
    });
  };

  const handleBodyImport = () => {
    try {
      const parsed = JSON.parse(jsonContent);
      setJsonError(null);
      importBodyMutation.mutate(parsed, {
        onSuccess: (result) => {
          revalidate();
          if (result.success) {
            setIsOpen(false);
            resetState();
          }
        },
      });
    } catch {
      setJsonError(t('data:import_org.invalid_json'));
    }
  };

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetState();
      }}
    >
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('data:import_org.title')}</Modal.Title>
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-s font-medium text-grey-primary">{t('data:import_org.method_file')}</p>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                className="hidden"
              />
              <Button
                className="flex-1"
                variant="secondary"
                appearance="stroked"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon icon="upload" className="size-5" />
                {selectedFile ? selectedFile.name : t('data:import_org.select_file')}
              </Button>
              <Button variant="primary" disabled={!selectedFile || isPending} onClick={handleFileImport}>
                {importFileMutation.isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
                {t('data:import_org.button_accept')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-grey-border h-px flex-1" />
            <span className="text-xs text-grey-secondary">{t('common:or')}</span>
            <div className="bg-grey-border h-px flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-s font-medium text-grey-primary">{t('data:import_org.method_body')}</p>
            <textarea
              className="border-grey-border focus:border-purple-primary text-s min-h-[120px] w-full rounded-lg border p-3 font-mono outline-none"
              placeholder={t('data:import_org.json_placeholder')}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setJsonError(null);
              }}
            />
            {jsonError ? <p className="text-xs text-red-primary">{jsonError}</p> : null}
            <Button
              className="self-end"
              variant="primary"
              disabled={jsonContent.trim().length === 0 || isPending}
              onClick={handleBodyImport}
            >
              {importBodyMutation.isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
              {t('data:import_org.button_accept')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
}
