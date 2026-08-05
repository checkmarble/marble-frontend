import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { type UpdateInboxesSlaPayload, useUpdateInboxesSlaMutation } from '@app-builder/queries/cases/update-inboxes';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Input, Switch } from 'ui-design-system';
import { z } from 'zod/v4';

const SLA_FORM_ID = 'sla-config-panel-form';

const slaInboxSchema = z.object({
  inboxId: z.uuid(),
  enabled: z.boolean(),
  sla: z.number().nullable(),
});

const slaFormSchema = z.object({
  inboxes: z.array(slaInboxSchema),
});

type SlaInboxValue = z.infer<typeof slaInboxSchema>;

interface SlaConfigPanelContentProps {
  readOnly?: boolean;
}

export const SlaConfigPanelContent = ({ readOnly }: SlaConfigPanelContentProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const updateSlaMutation = useUpdateInboxesSlaMutation();
  const revalidate = useLoaderRevalidator();

  const saveSla = (updates: UpdateInboxesSlaPayload) => {
    if (updates.length === 0) {
      panelSharp.actions.close();
      return Promise.resolve();
    }

    return updateSlaMutation
      .mutateAsync(updates)
      .then(() => {
        toast.success(t('cases:overview.panel.sla.saved'));
        revalidate();
        panelSharp.actions.close();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  };

  return (
    <Panel.Container size="small">
      <Panel.Content>
        <Panel.Header>{t('cases:overview.panel.sla.title')}</Panel.Header>
        {match(inboxesQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center py-xl">
              <Spinner className="size-8" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="text-s text-grey-secondary py-sm">{t('cases:overview.config.error_loading')}</div>
          ))
          .with({ isSuccess: true }, ({ data }) => (
            <SlaConfigForm inboxes={data.inboxes} onSave={saveSla} readOnly={readOnly} />
          ))
          .exhaustive()}
        {readOnly ? null : (
          <Panel.Footer>
            <Panel.FooterButton
              type="submit"
              form={SLA_FORM_ID}
              isLoading={updateSlaMutation.isPending}
              label={t('cases:overview.validate_config')}
            />
          </Panel.Footer>
        )}
      </Panel.Content>
    </Panel.Container>
  );
};

type SlaConfigFormProps = {
  inboxes: InboxWithCasesCount[];
  onSave: (updates: UpdateInboxesSlaPayload) => Promise<void>;
  readOnly?: boolean;
};

function SlaConfigForm({ inboxes, onSave, readOnly }: SlaConfigFormProps) {
  const form = useForm({
    defaultValues: {
      inboxes: inboxes.map((inbox) => ({
        inboxId: inbox.id,
        enabled: inbox.sla !== undefined && inbox.sla !== null,
        sla: inbox.sla ?? null,
      })),
    },
    validators: {
      onSubmit: slaFormSchema,
    },
    onSubmit: ({ value }) => {
      const initialSla = new Map(inboxes.map((inbox) => [inbox.id, inbox.sla ?? null]));

      const updates = value.inboxes
        .map(({ inboxId, enabled, sla }) => ({ inboxId, sla: enabled ? sla : null }))
        .filter(({ inboxId, sla }) => sla !== initialSla.get(inboxId));

      return onSave(updates);
    },
  });

  return (
    <form id={SLA_FORM_ID} className="flex flex-col gap-md" onSubmit={handleSubmit(form)}>
      {inboxes.map((inbox, index) => (
        <form.Field key={inbox.id} name={`inboxes[${index}]`}>
          {(field) => (
            <SlaInboxCard inbox={inbox} value={field.state.value} onChange={field.handleChange} disabled={readOnly} />
          )}
        </form.Field>
      ))}
    </form>
  );
}

type SlaInboxCardProps = {
  inbox: InboxWithCasesCount;
  value: SlaInboxValue;
  onChange: (value: SlaInboxValue) => void;
  disabled?: boolean;
};

function SlaInboxCard({ inbox, value, onChange, disabled }: SlaInboxCardProps) {
  const { t } = useTranslation('cases');

  return (
    <div className="flex items-center gap-sm justify-between">
      <label className="flex items-center gap-sm" htmlFor={inbox.id}>
        <Switch
          id={inbox.id}
          checked={value.enabled}
          onCheckedChange={(checked) => onChange({ ...value, enabled: checked, sla: checked ? value.sla : null })}
          disabled={disabled}
        />
        <span>{inbox.name}</span>
      </label>
      <div className="flex items-center gap-sm">
        <Input
          type="number"
          value={value.sla ?? ''}
          onChange={(e) => onChange({ ...value, sla: e.target.value === '' ? null : Number(e.target.value) })}
          disabled={disabled || !value.enabled}
          className="w-16"
        />
        <span className="text-xs text-grey-secondary">{t('cases:overview.panel.sla.days')}</span>
      </div>
    </div>
  );
}
