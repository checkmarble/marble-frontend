import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

export const SelectCaseById = ({ onNavigate }: { onNavigate: (caseId: string) => void }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const { t } = useTranslation(['cases']);
  const buttonText = t('cases:search.select_by_id');

  const handleSubmitValue = () => {
    const valueTrimmed = value.trim();
    if (z.uuid().safeParse(valueTrimmed).success) {
      onNavigate(valueTrimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    handleSubmitValue();
  };

  return open ? (
    <Input
      type="text"
      placeholder={buttonText}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      autoFocus
      className="w-85"
      endAdornment="arrow-right"
      adornmentClassName="size-4"
      onAdornmentClick={handleSubmitValue}
    />
  ) : (
    <ButtonV2 variant="secondary" size="default" onClick={() => setOpen(true)}>
      {buttonText}
      <Icon icon="arrow-right" className="size-4" />
    </ButtonV2>
  );
};
