import { Content, Root, Trigger } from '@radix-ui/react-popover';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { unique } from 'remeda';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

import { RuleGroup } from '../Rules/RuleGroup';

export const FieldRuleGroup = ({
  selectedRuleGroup,
  ruleGroups,
  disabled,
  onChange,
  onBlur,
}: {
  selectedRuleGroup?: string;
  ruleGroups: string[];
  disabled?: boolean;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [newRule, setNewRule] = useState<string | undefined>();
  const [value, setValue] = useState<string | undefined>();

  const finalRuleGroups = useMemo(
    () => unique([selectedRuleGroup, newRule, ...ruleGroups].filter(Boolean)) as string[],
    [selectedRuleGroup, ruleGroups, newRule],
  );

  return (
    <Root
      defaultOpen={false}
      onOpenChange={(open) => {
        if (open === false) {
          setValue('');
          onBlur?.();
        }
      }}
    >
      <div className="flex items-center gap-2">
        {selectedRuleGroup ? <RuleGroup ruleGroup={selectedRuleGroup} /> : null}
        <Trigger asChild>
          <Button
            disabled={disabled}
            variant="secondary"
            size={selectedRuleGroup ? 'icon' : undefined}
            className={clsx({ 'w-fit': !selectedRuleGroup })}
          >
            <Icon
              icon={selectedRuleGroup ? 'edit-square' : 'plus'}
              className="text-grey-80 size-4"
            />
            {!selectedRuleGroup ? <span>{t('scenarios:rules.add_group')}</span> : null}
          </Button>
        </Trigger>
      </div>
      <Content className="mt-1 min-w-[280px] shadow-md" align="start">
        <Command className="flex flex-col gap-2 p-2">
          <div className="border-grey-90 flex items-center gap-2 border-b p-2 pb-3">
            {selectedRuleGroup ? (
              <RuleGroup ruleGroup={selectedRuleGroup} onClear={() => onChange?.('')} />
            ) : null}
            <CommandInput
              placeholder={t('scenarios:rules.new_group')}
              value={value}
              onInput={(e) => setValue(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && value) {
                  setNewRule(value);
                  onChange?.(value);
                  setValue('');
                }
              }}
            />
          </div>
          <CommandList>
            {finalRuleGroups.length ? (
              <CommandGroup heading={t('scenarios:rules.heading')}>
                {finalRuleGroups.map((r) => (
                  <CommandItem
                    className="data-[selected=true]:bg-purple-98 rounded"
                    key={r}
                    onSelect={() => onChange?.(r)}
                  >
                    <RuleGroup ruleGroup={r} />
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : (
              <CommandEmpty className="flex items-center gap-2 p-2">
                <Icon icon="plus" className="text-grey-80 size-4" />
                <span className="text-grey-80">{t('scenarios:rules.empty_groups')}</span>
              </CommandEmpty>
            )}
            {value && !finalRuleGroups.includes(value) ? (
              <CommandItem asChild forceMount>
                <Button
                  variant="tertiary"
                  onClick={() => {
                    setNewRule(value);
                    onChange?.(value);
                    setValue('');
                  }}
                >
                  <Icon icon="plus" className="text-grey-00 size-4" />
                  <span className="text-grey-00 text-s inline-flex items-center gap-2">
                    {t('scenarios:rules.create')}
                    {value ? <RuleGroup ruleGroup={value} /> : null}
                  </span>
                </Button>
              </CommandItem>
            ) : null}
          </CommandList>
        </Command>
      </Content>
    </Root>
  );
};
