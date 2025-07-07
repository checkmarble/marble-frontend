import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Input, Switch } from 'ui-design-system';

import { scenarioI18n } from '../scenario-i18n';

interface FieldSkipIfUnderProps {
  value: number | null;
  onBlur: () => void;
  onChange: (value: number | null) => void;
  editor: 'view' | 'edit';
  name: string;
}

export const FieldSkipIfUnder = ({
  value,
  onBlur,
  onChange,
  editor,
  name,
}: FieldSkipIfUnderProps) => {
  const { t } = useTranslation(scenarioI18n);
  const [inputValue, setInputValue] = useState<number>(value ?? 5);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = +e.currentTarget.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={value !== null}
        onCheckedChange={(checked) => onChange(checked ? inputValue : null)}
        onBlur={onBlur}
        disabled={editor === 'view'}
      />
      <Trans
        t={t}
        i18nKey="scenarios:edit_sanction.ignore_check_if_under"
        components={{
          NbNumbers: (
            <Input
              type="number"
              name={name}
              className="z-0 h-6 w-14 py-0"
              value={inputValue}
              min={0}
              onChange={handleInputChange}
              disabled={editor === 'view' || value === null}
            />
          ),
        }}
      />
    </div>
  );
};
