import { Nudge } from '@app-builder/components/Nudge';
import { normalizeRoleBinding } from '@app-builder/models/user';
import { roleConditionsSchema } from '@app-builder/schemas/settings';
import { isAccessible } from '@app-builder/services/feature-access';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { type RoleBinding } from 'marble-api';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn, Panel, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { activeConditionKinds, RoleBindingConditions, type RoleConditions } from './RoleBindingConditions';
import { roleLabel } from './role-label';

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
            locked={!!binding.role && !options.some(({ value }) => value === binding.role)}
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
  locked,
  canDelete,
  onDelete,
  onChange,
}: {
  binding: RoleBinding;
  options: readonly UserRoleOption[];
  access: FeatureAccessLevelDto;
  timeZone: string;
  selectedLabel?: string;
  // The actor cannot grant this role, so they may neither change nor remove the binding.
  locked: boolean;
  canDelete: boolean;
  onDelete: () => void;
  onChange: (binding: RoleBinding) => void;
}) {
  const { t } = useTranslation(['settings']);
  const [open, setOpen] = useState(false);
  const disabled = locked || !isAccessible(access);
  const count = activeConditionKinds(binding.conditions).length;
  const roleOptions = locked
    ? [...options, { value: binding.role, label: selectedLabel ?? roleLabel(binding.role, t) }]
    : [...options];

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
          <SelectV2<string | null>
            value={binding.role || null}
            onChange={(role) => {
              if (role && role !== binding.role) onChange({ ...binding, role });
            }}
            disabled={disabled}
            placeholder={t('settings:users.role')}
            aria-label={t('settings:users.role')}
            options={roleOptions}
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
                onChange(normalizeRoleBinding({ ...binding, conditions }));
                setOpen(false);
              }}
              onDelete={() => {
                onChange(R.omit(binding, ['conditions']));
                setOpen(false);
              }}
            />
          </Panel.Container>
        </Panel.Root>
      </div>
    </div>
  );
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
        <RoleBindingConditions value={draft} onChange={setDraft} timeZone={timeZone} />
      </div>
      <Panel.Footer>
        <Panel.FooterButton isCloseButton label={t('common:cancel')} />
        <Panel.FooterButton
          label={t('common:save')}
          onClick={() => onSave(draft)}
          disabled={!roleConditionsSchema.safeParse(draft).success}
        />
      </Panel.Footer>
    </Panel.Content>
  );
}
