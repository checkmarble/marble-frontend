import { useDecisionRightPanelContext } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { CaseDetail } from '@app-builder/models/cases';
import { existingCaseSchema, newCaseSchema, useAddToCaseMutation } from '@app-builder/queries/cases/add-to-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

type OnSuccessAddFn = (type: 'new_case' | 'existing_case', caseDetail: CaseDetail) => void;

export function AddToCaseForm() {
  const { t } = useTranslation(['decisions']);
  const inboxesQuery = useGetInboxesQuery();
  const [isNewCase, setIsNewCase] = useState(false);
  const { closePanel } = useDecisionRightPanelContext();
  const router = useRouter();
  const navigate = useNavigate();

  const handleSuccess: OnSuccessAddFn = async (type, caseDetail) => {
    closePanel();
    await router.invalidate();

    if (type === 'new_case') {
      navigate({ to: '/cases/s/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) } });
    }
  };

  if (inboxesQuery.isPending) {
    return <p>Loading...</p>;
  }

  if (inboxesQuery.isError) {
    return <p>Error</p>;
  }

  const inboxes = inboxesQuery.data?.inboxes ?? [];
  if (inboxes.length === 0) {
    return <p>{t('decisions:add_to_case.new_case.no_inbox')}</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FormLabel name="newCase" className="text-xs first-letter:capitalize">
          {t('decisions:add_to_case.create_new_case')}
        </FormLabel>
        <Switch id="newCase" checked={isNewCase} onCheckedChange={(checked) => setIsNewCase(checked)} />
      </div>
      {isNewCase ? (
        <NewCaseForm inboxes={inboxes} onSuccess={handleSuccess} />
      ) : (
        <ExistingCaseForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}

interface Inbox {
  id: string;
  name: string;
}

function NewCaseForm({ inboxes, onSuccess }: { inboxes: Inbox[]; onSuccess: OnSuccessAddFn }) {
  const { t } = useTranslation(['decisions']);
  const addToCaseMutation = useAddToCaseMutation();
  const { data } = useDecisionRightPanelContext();

  const form = useForm({
    defaultValues: {
      name: '',
      inboxId: '',
    },
    validators: {
      onSubmit: newCaseSchema.pick({ name: true, inboxId: true }),
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      const caseDetail = await addToCaseMutation.mutateAsync({
        newCase: true,
        decisionIds: data?.decisionIds ?? [],
        ...value,
      });

      onSuccess('new_case', caseDetail);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-4">
        <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
          {t('decisions:add_to_case.new_case.informations')}
        </p>
        <form.Field
          name="name"
          validators={{
            onBlur: newCaseSchema.shape.name,
            onChange: newCaseSchema.shape.name,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.new_case.new_case_name')}
              </FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field
          name="inboxId"
          validators={{
            onBlur: newCaseSchema.shape.inboxId,
            onChange: newCaseSchema.shape.inboxId,
          }}
        >
          {(field) => (
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.new_case.select_inbox')}
              </FormLabel>
              <Select.Default
                className="w-full overflow-hidden"
                value={field.state.value}
                onValueChange={(type) => {
                  field.handleChange(type);
                  field.handleBlur();
                }}
              >
                {inboxes.map(({ name, id }) => {
                  return (
                    <Select.DefaultItem key={id} value={id}>
                      {name}
                    </Select.DefaultItem>
                  );
                })}
              </Select.Default>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <Button type="submit" form="add-to-case-form">
          <Icon icon="plus" className="size-5" />
          {t('decisions:add_to_case.create_new_case')}
        </Button>
      </div>
    </form>
  );
}

function ExistingCaseForm({ onSuccess }: { onSuccess: OnSuccessAddFn }) {
  const { t } = useTranslation(['decisions']);
  const addToCaseMutation = useAddToCaseMutation();
  const { data } = useDecisionRightPanelContext();

  const form = useForm({
    defaultValues: {
      caseId: '',
    },
    validators: {
      onSubmit: existingCaseSchema.pick({ caseId: true }),
    },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      const caseDetail = await addToCaseMutation.mutateAsync({
        newCase: false,
        decisionIds: data?.decisionIds ?? [],
        ...value,
      });

      onSuccess('existing_case', caseDetail);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-4">
        <p className="text-s text-grey-primary font-semibold first-letter:capitalize">
          {t('decisions:add_to_case.new_case.attribution')}
        </p>
        <form.Field
          name="caseId"
          validators={{
            onBlur: existingCaseSchema.shape.caseId,
            onChange: existingCaseSchema.shape.caseId,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.new_case.case_id.label')}
              </FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <Button type="submit" form="add-to-case-form">
          <Icon icon="plus" className="size-5" />
          {t('decisions:add_to_case')}
        </Button>
      </div>
    </form>
  );
}
