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
  const hasFile = selectedFile !== null;
  const hasJson = jsonContent.trim().length > 0;
  const canImport = (hasFile || hasJson) && !(hasFile && hasJson);

  const resetState = () => {
    setSelectedFile(null);
    setJsonContent('');
    setJsonError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = () => {
    if (hasFile) {
      importFileMutation.mutate(selectedFile, {
        onSuccess: (result) => {
          revalidate();
          if (result.success) {
            setIsOpen(false);
            resetState();
          }
        },
      });
    } else if (hasJson) {
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              disabled={hasJson}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
            <Button
              variant="secondary"
              appearance="stroked"
              disabled={hasJson}
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon icon="upload" className="size-5" />
              {selectedFile ? selectedFile.name : t('data:import_org.select_file')}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-grey-border h-px flex-1" />
            <span className="text-xs text-grey-secondary">{t('common:or')}</span>
            <div className="bg-grey-border h-px flex-1" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-s font-medium text-grey-primary">{t('data:import_org.method_body')}</p>
            <textarea
              className="border-grey-border focus:border-purple-primary text-s min-h-[120px] w-full rounded-lg border p-3 font-mono outline-none disabled:opacity-50"
              placeholder={t('data:import_org.json_placeholder')}
              disabled={hasFile}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setJsonError(null);
              }}
            />
            {jsonError ? <p className="text-xs text-red-primary">{jsonError}</p> : null}
          </div>
        </div>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button variant="primary" disabled={!canImport || isPending} onClick={handleImport}>
            {isPending ? <Icon icon="spinner" className="size-5 animate-spin" /> : null}
            {t('data:import_org.button_accept')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
