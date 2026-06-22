import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useImportOrgFromFileMutation, useImportOrgMutation } from '@app-builder/queries/data/import-org';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Callout } from '../Callout';

export function ImportOrg({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['data', 'common']);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileMutation = useImportOrgFromFileMutation();
  const importBodyMutation = useImportOrgMutation();
  const revalidate = useLoaderRevalidator();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasFile = selectedFile !== null;
  const hasJson = jsonContent.trim().length > 0;
  const canImport = (hasFile || hasJson) && !(hasFile && hasJson);

  const resetState = () => {
    setSelectedFile(null);
    setJsonContent('');
    setJsonError(null);
    setIsParsing(false);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    setErrorMessage(null);
    if (hasFile) {
      setIsParsing(true);
      importFileMutation.mutate(selectedFile, {
        onSuccess: (result) => {
          if (result.success) {
            revalidate();
            toast.success(t('data:import_org.success'));
            setIsOpen(false);
            resetState();
          } else {
            setErrorMessage(result.message);
            setIsParsing(false);
          }
        },
        onError: () => {
          toast.error(t('common:errors.backend_global_error.unknown'));
          setIsParsing(false);
        },
      });
    } else if (hasJson) {
      try {
        setIsParsing(true);
        const parsed = JSON.parse(jsonContent);
        setJsonError(null);
        importBodyMutation.mutate(parsed, {
          onSuccess: (result) => {
            if (result.success) {
              toast.success(t('data:import_org.success'));
              revalidate();
              setIsOpen(false);
              resetState();
            } else {
              setErrorMessage(result.message);
              setIsParsing(false);
            }
          },
          onError: () => {
            toast.error(t('common:errors.backend_global_error.unknown'));
            setIsParsing(false);
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
        <div className="flex flex-col gap-md p-lg">
          <div className="flex flex-col gap-sm">
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

          <div className="flex items-center gap-md">
            <div className="bg-grey-border h-px flex-1" />
            <span className="text-xs text-grey-secondary">{t('common:or')}</span>
            <div className="bg-grey-border h-px flex-1" />
          </div>

          <div className="flex flex-col gap-sm">
            <p className="text-s font-medium text-grey-primary">{t('data:import_org.method_body')}</p>
            <textarea
              className="border-grey-border focus:border-purple-primary text-s min-h-[120px] w-full rounded-lg border p-md font-mono outline-none disabled:opacity-50"
              placeholder={t('data:import_org.json_placeholder')}
              disabled={hasFile}
              value={jsonContent}
              onChange={(e) => {
                setJsonContent(e.target.value);
                setJsonError(null);
              }}
            />
            {jsonError ? <p className="text-xs text-red-primary">{jsonError}</p> : null}
            {errorMessage ? (
              <Callout color="red" icon="error" iconColor="red">
                {errorMessage}
              </Callout>
            ) : null}
          </div>
        </div>
        <Modal.Footer>
          <Modal.FooterButton isCloseButton label={t('common:cancel')} />
          <Modal.FooterButton
            label={t('data:import_org.button_accept')}
            type="submit"
            disabled={!canImport || isParsing}
            isLoading={isParsing}
            onClick={handleImport}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
