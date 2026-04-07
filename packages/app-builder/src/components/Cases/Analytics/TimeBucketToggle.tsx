import type { TimeBucket } from '@app-builder/models/analytics/case-analytics';
import { useTranslation } from 'react-i18next';
import { Button, cn } from 'ui-design-system';

const timeBuckets: TimeBucket[] = ['day', 'month', 'quarter'];

interface TimeBucketToggleProps {
  value: TimeBucket;
  onChange: (bucket: TimeBucket) => void;
}

export function TimeBucketToggle({ value, onChange }: TimeBucketToggleProps) {
  const { t } = useTranslation(['cases']);

  return (
    <div className="flex gap-v2-xs">
      {timeBuckets.map((bucket) => (
        <Button
          key={bucket}
          variant="secondary"
          onClick={() => onChange(bucket)}
          className={cn(value === bucket && 'bg-purple-background-light border-purple-primary text-purple-primary')}
        >
          {t(`cases:analytics.time_bucket.${bucket}`)}
        </Button>
      ))}
    </div>
  );
}
