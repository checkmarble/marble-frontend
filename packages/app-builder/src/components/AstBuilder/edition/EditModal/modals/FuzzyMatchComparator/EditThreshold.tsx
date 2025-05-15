import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';

interface EditThresholdProps {
  threshold: number;
  setThreshold: (threshold: number) => void;
}

export function EditThreshold({ threshold, setThreshold }: EditThresholdProps) {
  const { t } = useTranslation(['common', 'scenarios']);

  return (
    <div className="flex flex-1 flex-col gap-2">
      <label htmlFor="threshold" className="text-m text-grey-00 font-normal">
        {t('scenarios:edit_fuzzy_match.threshold.label')}
      </label>
      <Input
        id="threshold"
        type="number"
        value={threshold}
        onChange={(e) => {
          const newThreshold = Number.parseInt(e.target.value, 10);
          if (Number.isNaN(newThreshold)) {
            setThreshold(0);
            return;
          }
          if (newThreshold < 0) {
            setThreshold(0);
            return;
          }
          if (newThreshold > 100) {
            setThreshold(100);
            return;
          }
          setThreshold(newThreshold);
        }}
        min={0}
        max={100}
      />
    </div>
  );
}
