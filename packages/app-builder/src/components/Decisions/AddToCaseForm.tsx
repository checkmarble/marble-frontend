import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { PanelSharpFactory } from '@app-builder/components/Panel';
import { CaseDetail } from '@app-builder/models/cases';
import { existingCaseSchema, newCaseSchema, useAddToCaseMutation } from '@app-builder/queries/cases/add-to-case';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { useForm } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, SelectV2, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';

type OnSuccessAddFn = (type: 'new_case' | 'existing_case', caseDetail: CaseDetail) => void;

export function AddToCaseForm({ decisionIds }: { decisionIds: string[] }) {
  const { t } = useTranslation(['decisions']);
  const inboxesQuery = useGetInboxesQuery();
  const [isNewCase, setIsNewCase] = useState(false);
  const panelSharp = PanelSharpFactory.useSharp();
  const router = useRouter();
  const navigate = useNavigate();

  const handleSuccess: OnSuccessAddFn = async (type, caseDetail) => {
    panelSharp.actions.close();
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
    <div className="flex flex-col gap-md">
      <div className="flex items-center gap-sm">
        <FormLabel name="newCase" className="text-xs first-letter:capitalize">
          {t('decisions:add_to_case.create_new_case')}
        </FormLabel>
        <Switch id="newCase" checked={isNewCase} onCheckedChange={(checked) => setIsNewCase(checked)} />
      </div>
      {isNewCase ? (
        <NewCaseForm inboxes={inboxes} decisionIds={decisionIds} onSuccess={handleSuccess} />
      ) : (
        <ExistingCaseForm decisionIds={decisionIds} onSuccess={handleSuccess} />
      )}
    </div>
  );
}

interface Inbox {
  id: string;
  name: string;
}

function NewCaseForm({
  inboxes,
  decisionIds,
  onSuccess,
}: {
  inboxes: Inbox[];
  decisionIds: string[];
  onSuccess: OnSuccessAddFn;
}) {
  const { t } = useTranslation(['decisions']);
  const addToCaseMutation = useAddToCaseMutation();

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
        decisionIds,
        ...value,
      });

      onSuccess('new_case', caseDetail);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-md">
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
            <div className="flex flex-col gap-sm">
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
            <div className="flex flex-1 flex-col gap-sm">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.new_case.select_inbox')}
              </FormLabel>
              <SelectV2
                className="w-full overflow-hidden"
                value={field.state.value}
                onChange={(type) => {
                  field.handleChange(type);
                  field.handleBlur();
                }}
                placeholder={t('decisions:add_to_case.new_case.select_inbox')}
                options={inboxes.map(({ name, id }) => ({
                  label: name,
                  value: id,
                }))}
              />
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

function ExistingCaseForm({ decisionIds, onSuccess }: { decisionIds: string[]; onSuccess: OnSuccessAddFn }) {
  const { t } = useTranslation(['decisions']);
  const addToCaseMutation = useAddToCaseMutation();

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
        decisionIds,
        ...value,
      });

      onSuccess('existing_case', caseDetail);
    },
  });

  return (
    <form onSubmit={handleSubmit(form)} id="add-to-case-form">
      <div className="flex flex-col gap-md">
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
            <div className="flex flex-col gap-sm">
              <label htmlFor={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.new_case.case_id.label')}
              </label>
              <Input
                type="text"
                id={field.name}
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
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
