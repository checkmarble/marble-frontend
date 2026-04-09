import { Callout } from '@app-builder/components/Callout';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stepper, type StepperStep } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { UnsavedChangesDialog } from '../Shared/UnsavedChangesDialog';
import { CreateTableFormContext, useCreateTableForm } from './CreateTableContext';
import { CreateTableEntityStep } from './CreateTableEntityStep';
import { CreateTableFieldsStep } from './CreateTableFieldsStep';
import { CreateTableLinksStep } from './CreateTableLinksStep';
import {
  type FieldValidationError,
  type LinkValidationError,
  type SemanticTableFormValues,
  type TablePropertyError,
  type ValidationError,
  type ValidationScope,
  validateValues,
} from './createTable-types';

export function CreateTableDrawer({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (values: SemanticTableFormValues) => Promise<boolean>;
}) {
  const { t } = useTranslation(['data', 'common']);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);

  const form = useCreateTableForm(async (value) => {
    if (!form.state.isValid) return;
    const checkValidation = validateValues(value, 'all', t);
    if (!checkValidation.ok) {
      setValidationErrors(checkValidation.errors);
      return;
    }
    setValidationErrors([]);
    const saved = await onSave(value);
    if (!saved) return;
    form.reset();
    setCurrentStep(0);
  });

  const handleClose = useCallback(() => {
    setIsUnsavedChangesDialogOpen(false);
    setValidationErrors([]);
    form.reset();
    setCurrentStep(0);
    onClose();
  }, [form, onClose]);

  const steps = useMemo<StepperStep[]>(
    () => [
      { key: 'entity', label: t('data:create_table.step_entity') },
      { key: 'fields', label: t('data:create_table.step_fields') },
      { key: 'links', label: t('data:create_table.step_links') },
    ],
    [t],
  );

  const formValues = useStore(form.store, (state) => state.values);
  const isDirty = useStore(form.store, (state) => state.isDirty);
  const currentValidationScope = useMemo<ValidationScope>(() => {
    if (currentStep === 0) return 'table';
    if (currentStep === 1) return 'fields';
    return 'links';
  }, [currentStep]);

  const handleBackdropClose = useCallback(() => {
    if (!isDirty) {
      handleClose();
      return;
    }
    setIsUnsavedChangesDialogOpen(true);
  }, [handleClose, isDirty]);

  const handleConfirmDiscardChanges = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const tableErrorFields = useMemo(
    () =>
      new Set(
        validationErrors
          .filter((error): error is TablePropertyError => error.kind === 'table')
          .map((error) => error.field),
      ),
    [validationErrors],
  );

  const fieldErrorIds = useMemo(
    () =>
      new Set(
        validationErrors
          .filter((error): error is FieldValidationError => error.kind === 'field')
          .map((error) => error.fieldId),
      ),
    [validationErrors],
  );

  const linkErrorIds = useMemo(
    () =>
      new Set(
        validationErrors
          .filter((error): error is LinkValidationError => error.kind === 'link')
          .map((error) => error.linkId),
      ),
    [validationErrors],
  );

  function handleNext(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const result = validateValues(formValues, currentValidationScope, t);
    if (!result.ok) {
      setValidationErrors(result.errors);
      return;
    }

    setValidationErrors([]);
    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    if (currentStep > 0) {
      setValidationErrors([]);
      setCurrentStep((s) => s - 1);
    }
  }

  if (!open) return null;

  return (
    <CreateTableFormContext.Provider value={form}>
      {/* Backdrop */}
      <div
        className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs"
        onClick={handleBackdropClose}
      />
      {/* Drawer panel */}
      <aside className="animate-slideRightAndFadeIn fixed right-0 top-0 z-50 h-full w-[max(1280px,70vw)] border-l border-grey-border shadow-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="bg-surface-card flex h-full flex-col overflow-y-auto"
        >
          <header className="flex shrink-0 items-center gap-v2-md p-v2-lg">
            <button type="button" onClick={handleClose} className="rounded-lg p-2 hover:bg-grey-border">
              <Icon icon="x" className="size-5" />
            </button>
            <h3 className="text-l flex-1 font-semibold">{t('data:create_table.title')}</h3>
            <Stepper steps={steps} currentStep={currentStep} />
          </header>

          <div className="flex-1 overflow-auto px-v2-lg">
            {currentStep === 0 ? <CreateTableEntityStep errorFields={tableErrorFields} /> : null}
            {currentStep === 1 ? (
              <CreateTableFieldsStep errorFieldIds={fieldErrorIds} hasError={validationErrors.length > 0} />
            ) : null}
            {currentStep === 2 ? (
              <CreateTableLinksStep errorLinkIds={linkErrorIds} hasError={validationErrors.length > 0} />
            ) : null}
          </div>

          <footer className="flex shrink-0 justify-between gap-v2-md border-t border-grey-border p-v2-lg">
            {validationErrors.length > 0 ? (
              <Callout color="red" icon="lightbulb" iconColor="red">
                <ul className="flex flex-col gap-v2-xs pl-3">
                  {validationErrors.map((error, index) => (
                    <li key={`${error.kind}-${index}`}>{error.message}</li>
                  ))}
                </ul>
              </Callout>
            ) : (
              <div />
            )}
            <div className="flex justify-end gap-v2-md">
              <Button variant="secondary" appearance="stroked" onClick={handleClose}>
                {t('common:cancel')}
              </Button>
              {currentStep > 0 ? (
                <Button variant="secondary" appearance="stroked" onClick={handleBack}>
                  {t('data:create_table.button_back')}
                </Button>
              ) : null}
              {currentStep === 2 ? (
                <Button variant="primary" type="submit">
                  {t('data:create_table.button_save_table')}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext} type="button">
                  {t('data:create_table.button_next')}
                </Button>
              )}
            </div>
          </footer>
        </form>
      </aside>
      <UnsavedChangesDialog
        open={isUnsavedChangesDialogOpen}
        onOpenChange={setIsUnsavedChangesDialogOpen}
        onConfirm={handleConfirmDiscardChanges}
      />
    </CreateTableFormContext.Provider>
  );
}
