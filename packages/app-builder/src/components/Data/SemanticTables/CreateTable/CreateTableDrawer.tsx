import { Callout } from '@app-builder/components/Callout';
import { Panel } from '@app-builder/components/Panel';
import { useDataModel } from '@app-builder/services/data/data-model';
import { handleSubmit } from '@app-builder/utils/form';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stepper, type StepperStep, Typo } from 'ui-design-system';
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
  const dataModel = useDataModel();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isUnsavedChangesDialogOpen, setIsUnsavedChangesDialogOpen] = useState(false);

  const form = useCreateTableForm(async (value) => {
    if (!form.state.isValid) return;
    const checkValidation = validateValues(value, 'all', t, false, dataModel);
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

    const result = validateValues(formValues, currentValidationScope, t, true, dataModel);
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

  if (!open) return;

  return (
    <CreateTableFormContext.Provider value={form}>
      <Panel.Root
        open={open}
        onOpenChange={(state) => {
          if (!state) {
            handleBackdropClose();
          }
        }}
      >
        <form onSubmit={handleSubmit(form)}>
          <Panel.Container size="large">
            <Panel.Content>
              <Panel.Header>
                <div className="flex shrink-0 items-center gap-md">
                  <Typo variant="subtitle1" className="flex-1">
                    {t('data:create_table.title')}
                  </Typo>
                  <Stepper steps={steps} currentStep={currentStep} />
                </div>
              </Panel.Header>

              <div className="flex-1 flex flex-col">
                {currentStep === 0 ? <CreateTableEntityStep errorFields={tableErrorFields} /> : null}
                {currentStep === 1 ? (
                  <CreateTableFieldsStep errorFieldIds={fieldErrorIds} hasError={validationErrors.length > 0} />
                ) : null}
                {currentStep === 2 ? (
                  <CreateTableLinksStep errorLinkIds={linkErrorIds} hasError={validationErrors.length > 0} />
                ) : null}
              </div>
              <Panel.Footer>
                {validationErrors.length > 0 ? (
                  <Callout color="red" icon="lightbulb" iconColor="red">
                    <ul className="flex flex-col gap-xs ps-md">
                      {validationErrors.map((error, index) => (
                        <li key={`${error.kind}-${index}`}>{error.message}</li>
                      ))}
                    </ul>
                  </Callout>
                ) : (
                  <div />
                )}
                <div className="flex justify-end gap-md ms-auto">
                  <Panel.FooterButton variant="secondary" onClick={handleBackdropClose} label={t('common:cancel')} />
                  {currentStep > 0 ? (
                    <Panel.FooterButton
                      variant="secondary"
                      onClick={handleBack}
                      label={t('data:create_table.button_back')}
                    />
                  ) : null}
                  {currentStep === 2 ? (
                    <Panel.FooterButton
                      variant="primary"
                      type="submit"
                      label={t('data:create_table.button_save_table')}
                    />
                  ) : (
                    <Panel.FooterButton
                      variant="primary"
                      onClick={handleNext}
                      type="button"
                      label={t('data:create_table.button_next')}
                    />
                  )}
                </div>
              </Panel.Footer>
            </Panel.Content>
          </Panel.Container>
        </form>
      </Panel.Root>

      <UnsavedChangesDialog
        open={isUnsavedChangesDialogOpen}
        onOpenChange={setIsUnsavedChangesDialogOpen}
        onConfirm={handleConfirmDiscardChanges}
      />
    </CreateTableFormContext.Provider>
  );
}
