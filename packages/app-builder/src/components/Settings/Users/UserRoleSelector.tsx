import { Nudge } from '@app-builder/components/Nudge';
import { roleBindingsSchema } from '@app-builder/schemas/settings';
import { isAccessible } from '@app-builder/services/feature-access';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { type RoleBinding } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Panel } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { RoleBindingConditions, type RoleConditions } from './RoleBindingConditions';
import { UserRoleField } from './UserRoleField';

export interface UserRoleOption {
  value: string;
  label: string;
}

export function UserRoleSelector({
  roles,
  options,
  access,
  onChange,
  roleLabels,
}: {
  roles: RoleBinding[];
  options: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  onChange: (roles: RoleBinding[]) => void;
  roleLabels?: ReadonlyMap<string, string>;
}) {
  const { t } = useTranslation(['settings']);
  const id = useId();
  const { org } = useOrganizationDetails();
  const keys = useRef(new WeakMap<RoleBinding, number>());
  const nextKey = useRef(0);

  const getKey = (binding: RoleBinding) => {
    let key = keys.current.get(binding);
    if (key === undefined) {
      key = nextKey.current++;
      keys.current.set(binding, key);
    }
    return key;
  };

  return (
    <div className="flex flex-col gap-xs">
      <div className="text-s text-grey-secondary flex items-center gap-sm">
        <span id={`${id}-label`} className={cn(access === 'restricted' && 'text-grey-disabled')}>
          {t('settings:users.role')}
        </span>
        {access === 'allowed' ? null : (
          <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
        )}
      </div>
      <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-md">
        {roles.map((binding, index) => (
          <RoleBindingRow
            key={getKey(binding)}
            binding={binding}
            options={options}
            access={access}
            timeZone={org.defaultScenarioTimezone ?? 'UTC'}
            selectedLabel={roleLabels?.get(binding.role)}
            canDelete={roles.length > 1}
            onDelete={() => onChange(roles.filter((_, itemIndex) => itemIndex !== index))}
            onChange={(next) => {
              keys.current.set(next, getKey(binding));
              onChange(roles.map((item, itemIndex) => (itemIndex === index ? next : item)));
            }}
          />
        ))}
      </div>
      {/* <Button type="button" onClick={() => onChange([...roles, { role: '' }])}>
        {t('settings:users.role.add')}
      </Button> */}
    </div>
  );
}

function RoleBindingRow({
  binding,
  options,
  access,
  timeZone,
  selectedLabel,
  canDelete,
  onDelete,
  onChange,
}: {
  binding: RoleBinding;
  options: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  timeZone: string;
  selectedLabel?: string;
  canDelete: boolean;
  onDelete: () => void;
  onChange: (binding: RoleBinding) => void;
}) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);
  const disabled = !isAccessible(access);
  const count = countConditions(binding.conditions);

  return (
    <div className="flex flex-col gap-md rounded-md border border-grey-border p-md">
      <div className="flex items-center gap-sm">
        <Button
          type="button"
          mode="icon"
          variant="secondary"
          size="large"
          aria-label={t('settings:users.role.delete')}
          disabled={!canDelete || disabled}
          onClick={onDelete}
        >
          <Icon icon="delete" className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <UserRoleField
            value={binding.role || null}
            userRoles={options}
            access={access}
            selectedLabel={selectedLabel}
            onChange={(role) =>
              onChange(
                binding.role === role
                  ? binding
                  : { role, ...(binding.conditions !== undefined && { conditions: binding.conditions }) },
              )
            }
          />
        </div>
        <Panel.Root open={open} onOpenChange={setOpen}>
          <Panel.Trigger asChild>
            <Button size="large" type="button" variant="secondary" appearance="stroked" disabled={disabled}>
              {count ? t('settings:users.role.conditions.count', { count }) : t('settings:users.role.add_conditions')}
            </Button>
          </Panel.Trigger>
          <Panel.Container size="medium" aria-label={t('settings:users.role.conditions.title')}>
            <ConditionsPanel
              initialConditions={binding.conditions}
              timeZone={timeZone}
              onSave={(conditions) => {
                if (countConditions(conditions)) onChange({ ...binding, conditions });
                else {
                  const { conditions: _, ...withoutConditions } = binding;
                  onChange(withoutConditions);
                }
                setOpen(false);
              }}
              onDelete={() => {
                const { conditions: _, ...withoutConditions } = binding;
                onChange(withoutConditions);
                setOpen(false);
              }}
            />
          </Panel.Container>
        </Panel.Root>
      </div>
    </div>
  );
}

function countConditions(conditions?: RoleConditions) {
  if (!conditions) return 0;
  return [
    !!(conditions.not_before || conditions.not_after),
    !!conditions.day_of_week?.length,
    !!conditions.time_of_day?.length,
    !!conditions.networks?.length,
    conditions.used_second_factor === true,
  ].filter(Boolean).length;
}

function ConditionsPanel({
  initialConditions,
  timeZone,
  onSave,
  onDelete,
}: {
  initialConditions?: RoleConditions;
  timeZone: string;
  onSave: (conditions: RoleConditions) => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const [draft, setDraft] = useState<RoleConditions>(initialConditions ?? {});

  return (
    <Panel.Content>
      <Panel.Header>
        <div className="flex items-center justify-between gap-md">
          {t('settings:users.role.conditions.title')}
          <Button
            type="button"
            mode="icon"
            variant="secondary"
            aria-label={t('settings:users.role.conditions.delete')}
            onClick={onDelete}
            disabled={!initialConditions}
          >
            <Icon icon="delete" className="size-4" />
          </Button>
        </div>
      </Panel.Header>
      <div className="py-lg">
        <RoleBindingConditions value={draft} onChange={setDraft} timeZone={timeZone} disabled={false} />
      </div>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label={t('common:cancel')} />
        <Panel.FooterButton
          label={t('common:save')}
          onClick={() => onSave(draft)}
          disabled={!roleBindingsSchema.element.shape.conditions.safeParse(draft).success}
        />
      </Panel.Footer>
    </Panel.Content>
  );
}
