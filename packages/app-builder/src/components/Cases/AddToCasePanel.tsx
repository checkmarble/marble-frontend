import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { type CaseDetail } from '@app-builder/models/cases';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Panel, PanelSharpFactory, SelectV2, Switch } from 'ui-design-system';
import { z } from 'zod/v4';

const newCaseFieldsSchema = z.object({ name: z.string().min(1), inboxId: z.string().min(1) });
const existingCaseFieldsSchema = z.object({ caseId: z.string().min(1) });

interface AddToCasePanelProps {
  initialMode?: 'new' | 'existing';
  onCreateCase: (values: z.infer<typeof newCaseFieldsSchema>) => Promise<CaseDetail>;
  onAddToCase: (values: z.infer<typeof existingCaseFieldsSchema>) => Promise<CaseDetail>;
}

export function AddToCasePanel({ initialMode = 'existing', onCreateCase, onAddToCase }: AddToCasePanelProps) {
  const { t } = useTranslation('cases');

  return (
    <Panel.Container size="small" className="max-w-md">
      <Panel.Content className="gap-md">
        <Panel.Header>
          <span className="first-letter:capitalize">{t('cases:add_to_case.title')}</span>
        </Panel.Header>
        <AddToCaseForm initialMode={initialMode} onCreateCase={onCreateCase} onAddToCase={onAddToCase} />
      </Panel.Content>
    </Panel.Container>
  );
}

function AddToCaseForm({ initialMode = 'existing', onCreateCase, onAddToCase }: AddToCasePanelProps) {
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const [isNewCase, setIsNewCase] = useState(initialMode === 'new');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const panelSharp = PanelSharpFactory.useSharp();
  const router = useRouter();
  const navigate = useNavigate();

  const handleSuccess = async (type: 'new' | 'existing', caseDetail: CaseDetail) => {
    panelSharp.actions.close();
    await router.invalidate();

    if (type === 'new') {
      await navigate({ to: '/cases/s/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) } });
    }
  };

  const submitNewCase = async (values: z.infer<typeof newCaseFieldsSchema>) => {
    setIsSubmitting(true);
    try {
      await handleSuccess('new', await onCreateCase(values));
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitExistingCase = async (values: z.infer<typeof existingCaseFieldsSchema>) => {
    setIsSubmitting(true);
    try {
      await handleSuccess('existing', await onAddToCase(values));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inboxes = inboxesQuery.data?.inboxes ?? [];
  const canCreate = inboxesQuery.isSuccess && inboxes.length > 0;

  return (
    <>
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-sm">
          <label htmlFor="newCase" className="text-xs first-letter:capitalize">
            {t('cases:add_to_case.create_new_case')}
          </label>
          <Switch id="newCase" checked={isNewCase} onCheckedChange={setIsNewCase} disabled={isSubmitting} />
        </div>
        {isNewCase ? (
          inboxesQuery.isPending ? (
            <p>{t('common:loading')}</p>
          ) : inboxesQuery.isError ? (
            <p>{t('common:errors.backend_global_error.unknown')}</p>
          ) : !canCreate ? (
            <p>{t('cases:add_to_case.no_inbox')}</p>
          ) : (
            <NewCaseForm inboxes={inboxes} onSubmit={submitNewCase} />
          )
        ) : (
          <ExistingCaseForm onSubmit={submitExistingCase} />
        )}
      </div>
      <Panel.Footer>
        <Panel.FooterButton
          type="submit"
          form="add-to-case-form"
          leadingIcon="plus"
          label={t(isNewCase ? 'cases:add_to_case.create' : 'cases:add_to_case.add')}
          disabled={isSubmitting || (isNewCase && !canCreate)}
          isLoading={isSubmitting}
        />
      </Panel.Footer>
    </>
  );
}

interface Inbox {
  id: string;
  name: string;
}

function NewCaseForm({
  inboxes,
  onSubmit,
}: {
  inboxes: Inbox[];
  onSubmit: (values: z.infer<typeof newCaseFieldsSchema>) => Promise<void>;
}) {
  const { t } = useTranslation('cases');
  const form = useForm({
    defaultValues: { name: '', inboxId: '' },
    validators: { onSubmit: newCaseFieldsSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      await onSubmit(value);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-md">
        <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
          {t('cases:add_to_case.information')}
        </p>
        <form.Field
          name="name"
          validators={{ onBlur: newCaseFieldsSchema.shape.name, onChange: newCaseFieldsSchema.shape.name }}
        >
          {(field) => (
            <div className="flex flex-col gap-sm">
              <label htmlFor="new-case-name" className="text-xs first-letter:capitalize">
                {t('cases:add_to_case.new_case_name')}
              </label>
              <Input
                id="new-case-name"
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="inboxId"
          validators={{ onBlur: newCaseFieldsSchema.shape.inboxId, onChange: newCaseFieldsSchema.shape.inboxId }}
        >
          {(field) => (
            <div className="flex flex-1 flex-col gap-sm">
              <label htmlFor="new-case-inbox" className="text-xs first-letter:capitalize">
                {t('cases:add_to_case.select_inbox')}
              </label>
              <SelectV2
                className="w-full overflow-hidden"
                value={field.state.value}
                onChange={(value) => {
                  field.handleChange(value);
                  field.handleBlur();
                }}
                placeholder={t('cases:add_to_case.select_inbox')}
                options={inboxes.map(({ name, id }) => ({ label: name, value: id }))}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
    </form>
  );
}

function ExistingCaseForm({
  onSubmit,
}: {
  onSubmit: (values: z.infer<typeof existingCaseFieldsSchema>) => Promise<void>;
}) {
  const { t } = useTranslation('cases');
  const form = useForm({
    defaultValues: { caseId: '' },
    validators: { onSubmit: existingCaseFieldsSchema },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;
      await onSubmit(value);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-md">
        <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
          {t('cases:add_to_case.attribution')}
        </p>
        <form.Field
          name="caseId"
          validators={{
            onBlur: existingCaseFieldsSchema.shape.caseId,
            onChange: existingCaseFieldsSchema.shape.caseId,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-sm">
              <label htmlFor="existing-case-id" className="text-xs first-letter:capitalize">
                {t('cases:add_to_case.case_id')}
              </label>
              <Input
                id="existing-case-id"
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
      </div>
    </form>
  );
}
