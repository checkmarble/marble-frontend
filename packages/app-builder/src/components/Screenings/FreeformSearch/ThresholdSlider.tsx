import clsx from 'clsx';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

import { screeningsI18n } from '../screenings-i18n';

interface ThresholdSliderProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export const ThresholdSlider: FunctionComponent<ThresholdSliderProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation(screeningsI18n);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue === '') {
      onChange(undefined);
      return;
    }
    const numValue = parseInt(newValue, 10);
    if (isNaN(numValue)) {
      onChange(undefined);
      return;
    }
    if (numValue < 0) {
      onChange(0);
      return;
    }
    if (numValue > 100) {
      onChange(100);
      return;
    }
    onChange(numValue);
  };

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <label className="text-s font-medium text-grey-primary">{t('screenings:freeform_search.threshold_label')}</label>
      <Input type="number" value={value ?? ''} onChange={handleChange} min={0} max={100} placeholder="0-100" />
      <p className="text-xs text-grey-placeholder">{t('screenings:freeform_search.threshold_description')}</p>
    </div>
  );
};

export default ThresholdSlider;
