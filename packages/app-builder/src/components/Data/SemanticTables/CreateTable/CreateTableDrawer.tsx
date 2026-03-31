import { type CreateTableValue } from '@app-builder/queries/data/create-table';
import { useStore } from '@tanstack/react-form';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Stepper, type StepperStep } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CreateTableFormContext, useCreateTableForm } from './CreateTableContext';
import { CreateTableEntityStep } from './CreateTableEntityStep';
import { CreateTableFieldsStep } from './CreateTableFieldsStep';
import { CreateTableLinksStep } from './CreateTableLinksStep';
import { adaptCreateTableValue, canProceedToStep2, validateValues } from './createTable-types';

export function CreateTableDrawer({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (adapted: CreateTableValue) => Promise<void>;
}) {
  const { t } = useTranslation(['data', 'common']);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useCreateTableForm(async (value) => {
    if (!form.state.isValid) return;
    const checkValidation = validateValues(value);
    if (!checkValidation.ok) {
      toast.error(checkValidation.errors.join('\n'));
      return;
    }
    await onSave(adaptCreateTableValue(value));
    form.reset();
    setCurrentStep(0);
  });

  const handleClose = useCallback(() => {
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

  const canNext = currentStep === 0 ? canProceedToStep2(formValues) : true;

  function handleNext(e: React.MouseEvent<HTMLButtonElement>) {
    if (canNext) {
      setCurrentStep((s) => s + 1);
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }

  if (!open) return null;

  return (
    <CreateTableFormContext.Provider value={form}>
      {/* Backdrop */}
      <div
        className="animate-overlay-show bg-grey-primary/20 fixed inset-0 z-40 backdrop-blur-xs"
        onClick={handleClose}
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
            {currentStep === 0 ? <CreateTableEntityStep /> : null}
            {currentStep === 1 ? <CreateTableFieldsStep /> : null}
            {currentStep === 2 ? <CreateTableLinksStep /> : null}
          </div>

          <footer className="flex shrink-0 justify-end gap-v2-md border-t border-grey-border p-v2-lg">
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
              <Button variant="primary" disabled={!canNext} onClick={handleNext} type={'button'}>
                {t('data:create_table.button_next')}
              </Button>
            )}
          </footer>
        </form>
      </aside>
    </CreateTableFormContext.Provider>
  );
}
