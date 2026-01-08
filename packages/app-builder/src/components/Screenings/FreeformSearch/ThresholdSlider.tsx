import clsx from 'clsx';
import { type FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { screeningsI18n } from '../screenings-i18n';

interface ThresholdSliderProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  className?: string;
}

export const ThresholdSlider: FunctionComponent<ThresholdSliderProps> = ({ value, onChange, className }) => {
  const { t } = useTranslation(screeningsI18n);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-s font-medium text-grey-primary">
          {t('screenings:freeform_search.threshold_label')}
        </label>
        {value !== undefined && (
          <button
            type="button"
            onClick={handleClear}
            className="text-s text-purple-primary hover:text-purple-primary/80"
          >
            {t('screenings:freeform_search.clear')}
          </button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value ?? 50}
          onChange={handleChange}
          className={clsx(
            'h-2 w-full cursor-pointer appearance-none rounded-full',
            'bg-grey-background-light dark:bg-grey-background-light',
            '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-primary',
            '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-purple-primary',
          )}
        />
        <span className="text-s min-w-[3ch] text-right font-semibold text-grey-primary">{value ?? '-'}</span>
      </div>
      <p className="text-xs text-grey-placeholder">{t('screenings:freeform_search.threshold_description')}</p>
    </div>
  );
};

export default ThresholdSlider;
