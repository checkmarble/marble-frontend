import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { Spinner } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { InboxWithCasesCount } from '@app-builder/models/inbox';
import { useGetInboxesQuery } from '@app-builder/queries/cases/get-inboxes';
import { useUpdateInboxesSlaMutation } from '@app-builder/queries/cases/update-inboxes';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Input, Switch } from 'ui-design-system';

type SlaSettings = number | null | undefined;
type InboxSlaState = Map<string, SlaSettings>;

interface SlaConfigPanelContentProps {
  readOnly?: boolean;
}

export const SlaConfigPanelContent = ({ readOnly }: SlaConfigPanelContentProps) => {
  const panelSharp = PanelSharpFactory.useSharp();
  const { t } = useTranslation(['cases', 'common']);
  const inboxesQuery = useGetInboxesQuery();
  const updateSlaMutation = useUpdateInboxesSlaMutation();
  const revalidate = useLoaderRevalidator();

  const [slaState, setSlaState] = useState<InboxSlaState>(new Map());

  const inboxes = inboxesQuery.data?.inboxes ?? [];

  // Sync sla state when query data updates
  useEffect(() => {
    if (inboxesQuery.isSuccess) {
      const initialState = new Map<string, SlaSettings>();
      for (const inbox of inboxesQuery.data?.inboxes ?? []) {
        initialState.set(inbox.id, inbox.sla);
      }
      setSlaState(initialState);
    }
  }, [inboxesQuery.data]);

  const handleChange = (inboxId: string, value: SlaSettings) => {
    setSlaState((prev) => {
      const newState = new Map(prev);
      newState.set(inboxId, value);
      return newState;
    });
  };

  const handleSave = () => {
    const updates: {
      inboxId: string;
      sla: SlaSettings;
    }[] = [];

    for (const inbox of inboxes) {
      const currentSettings = slaState.get(inbox.id);
      if (currentSettings === undefined) continue;

      // Check if settings changed
      const hasChanged = currentSettings !== inbox.sla;

      if (hasChanged) {
        updates.push({
          inboxId: inbox.id,
          sla: currentSettings,
        });
      }
    }

    if (updates.length > 0) {
      updateSlaMutation.mutate(updates, {
        onSuccess: () => {
          toast.success(t('cases:overview.panel.sla.saved'));
          revalidate();
          panelSharp.actions.close();
        },
        onError: () => {
          toast.error(t('common:errors.unknown'));
        },
      });
    } else {
      panelSharp.actions.close();
    }
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
          .with({ isSuccess: true }, () => (
            <div className="flex flex-col gap-md">
              {inboxes.map((inbox) => {
                const settings = slaState.get(inbox.id);
                return (
                  <SlaInboxCard
                    key={inbox.id}
                    inbox={inbox}
                    settings={settings}
                    onChange={(value) => handleChange(inbox.id, value)}
                    disabled={readOnly}
                  />
                );
              })}
            </div>
          ))
          .exhaustive()}
        {readOnly ? null : (
          <Panel.Footer>
            <Panel.FooterButton
              onClick={handleSave}
              isLoading={updateSlaMutation.isPending}
              label={t('cases:overview.validate_config')}
            />
          </Panel.Footer>
        )}
      </Panel.Content>
    </Panel.Container>
  );
};

type SlaInboxCardProps = {
  inbox: InboxWithCasesCount;
  settings: SlaSettings;
  onChange: (value: SlaSettings) => void;
  disabled?: boolean;
};

function SlaInboxCard({ inbox, settings, onChange, disabled }: SlaInboxCardProps) {
  const [isToggled, setIsToggled] = useState(settings !== undefined && settings !== null);
  const { t } = useTranslation('cases');

  const handleIsToggledChange = (checked: boolean) => {
    setIsToggled(checked);
    if (!checked) onChange(null);
  };

  return (
    <div className="flex items-center gap-sm justify-between">
      <label className="flex items-center gap-sm" htmlFor={inbox.id}>
        <Switch id={inbox.id} checked={isToggled} onCheckedChange={handleIsToggledChange} disabled={disabled} />
        <span>{inbox.name}</span>
      </label>
      <div className="flex items-center gap-sm">
        <Input
          type="number"
          value={settings ?? ''}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled || !isToggled}
          className="w-16"
        />
        <span className="text-xs text-grey-secondary">{t('cases:overview.panel.sla.days')}</span>
      </div>
    </div>
  );
}
