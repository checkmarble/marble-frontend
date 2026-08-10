import type { TimeBucket } from '@app-builder/models/analytics/case-analytics';
import { useTranslation } from 'react-i18next';

import { SegmentedToggle } from './SegmentedToggle';

const timeBuckets: TimeBucket[] = ['day', 'month', 'quarter'];

interface TimeBucketToggleProps {
  value: TimeBucket;
  onChange: (bucket: TimeBucket) => void;
}

export function TimeBucketToggle({ value, onChange }: TimeBucketToggleProps) {
  const { t } = useTranslation(['cases']);

  return (
    <SegmentedToggle
      options={timeBuckets}
      value={value}
      onChange={onChange}
      getLabel={(bucket) => t(`cases:analytics.time_bucket.${bucket}`)}
    />
  );
}
