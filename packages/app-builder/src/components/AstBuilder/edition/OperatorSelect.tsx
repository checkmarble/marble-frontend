import { Nudge } from '@app-builder/components/Nudge';
import { undefinedAstNodeName } from '@app-builder/models';
import { getOperatorName } from '@app-builder/models/get-operator-name';
import { cva, type VariantProps } from 'class-variance-authority';
import { type FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

export const operatorContainerClassnames = cva(
  [
    'flex h-10 min-w-[40px] items-center justify-between outline-hidden gap-2 rounded-sm px-2 border',
    'bg-surface-card disabled:border-grey-background-light disabled:bg-grey-background-light',
    'radix-state-open:border-purple-primary  radix-state-open:bg-purple-background-light',
  ],
  {
    variants: {
      validationStatus: {
        valid: 'border-grey-border focus:border-purple-primary',
        error: 'border-red-primary focus:border-purple-primary',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

export type OperatorSelectOptions<Op extends string> = Record<Op, { keywords?: string[] }>;

export function OperatorSelect<Op extends string>({
  options,
  operator,
  onOperatorChange,
  validationStatus,
  isFilter = false,
  hideArrow = false,
  featureAccess,
  isOperatorRestricted,
}: {
  options: readonly Op[] | OperatorSelectOptions<Op>;
  operator: Op | null;
  onOperatorChange: (v: Op) => void;
  isFilter?: boolean;
  hideArrow?: boolean;
  featureAccess?: FeatureAccessLevelDto;
  isOperatorRestricted?: (op: Op) => boolean;
} & VariantProps<typeof operatorContainerClassnames>) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['common', 'scenarios']);
  const mappedOptions = mapOptions(options);

  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  const isRestricted = featureAccess && featureAccess !== 'allowed';
  const isCurrentRestricted = _value ? (isOperatorRestricted?.(_value) ?? false) : false;
  const showTriggerNudge = isCurrentRestricted && isRestricted && featureAccess;

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <button type="button" className={operatorContainerClassnames({ validationStatus })}>
          <span className="text-s text-grey-primary w-full text-center font-medium">
            {_value ? getOperatorName(t, _value, isFilter) : '...'}
          </span>
          {showTriggerNudge ? <Nudge kind={featureAccess} content={t('common:premium')} className="size-5" /> : null}
          {!showTriggerNudge && !hideArrow ? <MenuCommand.Arrow /> : null}
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth sideOffset={4} align="start" className="min-w-24">
        <MenuCommand.Combobox />
        <MenuCommand.List>
          {mappedOptions.map((op) => {
            const isOpRestricted = isOperatorRestricted?.(op.value) ?? false;
            const showNudge = isOpRestricted && isRestricted && featureAccess;

            return (
              <MenuCommand.Item
                keywords={op.keywords ?? [op.value]}
                selected={operator === op.value}
                key={op.value}
                onSelect={() => onOperatorChange(op.value)}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="font-semibold">{getOperatorName(t, op.value, isFilter)}</span>
                  {showNudge ? <Nudge kind={featureAccess} content={t('common:premium')} className="size-5" /> : null}
                </div>
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

type Options<Op extends string> = {
  value: Op;
  keywords?: string[];
}[];

function mapOptions<Op extends string>(options: readonly Op[] | OperatorSelectOptions<Op>): Options<Op> {
  const isOpSelect = isOperationSelectOptions(options);
  const values = isOpSelect ? (Object.keys(options) as Op[]) : options;

  return values.map((value) => {
    if (isOpSelect) {
      return { value, ...options[value] };
    } else {
      return { value };
    }
  });
}

function isOperationSelectOptions<Op extends string>(
  opts: readonly Op[] | OperatorSelectOptions<Op>,
): opts is OperatorSelectOptions<Op> {
  return !Array.isArray(opts);
}
