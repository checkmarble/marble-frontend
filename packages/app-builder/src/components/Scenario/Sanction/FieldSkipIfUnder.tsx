import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Switch } from 'ui-design-system';

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
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<number>(value ?? 0);

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
      <span className="text-s">{t('scenarios:edit_sanction.ignore_check_if_under')}</span>
      <Input
        type="number"
        name={name}
        className="z-0 h-6 w-14 py-0"
        value={inputValue}
        min={1}
        onChange={handleInputChange}
        disabled={editor === 'view' || value === null}
      />
      <span className="text-s">
        {t('scenarios:edit_sanction.ignore_check_if_under.characters')}
      </span>
    </div>
  );
};
