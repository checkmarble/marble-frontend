import { Radio, RadioGroup, RadioProvider } from '@ariakit/react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { type ReactNode } from 'react';
import { Icon } from 'ui-icons';

import { StatusTag } from './StatusTag';

export type StatusRadioGroupProps = {
  value: string;
  onChange: (value: string) => void;
};

export function StatusRadioGroup({ value, onChange }: StatusRadioGroupProps) {
  return (
    <RadioProvider>
      <RadioGroup className="grid grid-cols-2 gap-2">
        <RadioItem value="confirmed_hit" checked={value === 'confirmed_hit'} onCheck={() => onChange('confirmed_hit')}>
          <StatusTag disabled status="confirmed_hit" />
        </RadioItem>
        <RadioItem value="no_hit" checked={value === 'no_hit'} onCheck={() => onChange('no_hit')}>
          <StatusTag disabled status="no_hit" />
        </RadioItem>
      </RadioGroup>
    </RadioProvider>
  );
}

type RadioItemProps = {
  value: string;
  checked: boolean;
  children: ReactNode;
  onCheck: () => void;
};

const radio = cva('transition-colors border-grey-90 flex items-center gap-2 rounded border p-2', {
  variants: {
    checked: {
      true: 'text-purple-65',
      false: 'text-grey-90 cursor-pointer',
    },
  },
});

function RadioItem({ value, children, checked, onCheck }: RadioItemProps) {
  return (
    <label className={clsx(radio({ checked }), '')}>
      <Radio name="status" className="hidden" value={value} checked={checked} onChange={onCheck} />
      <Icon icon={checked ? 'radio-selected' : 'radio-unselected'} className="size-6" />
      {children}
    </label>
  );
}
