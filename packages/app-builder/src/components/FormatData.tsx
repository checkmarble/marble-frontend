import { formatDateTimeWithoutPresets, formatNumber } from '@app-builder/utils/format';

import { ExternalLink } from './ExternalLink';

type Data =
  | {
      type: 'url' | 'datetime';
      value: string;
    }
  | {
      type: 'number';
      value: number;
    }
  | {
      type: 'unknown';
      value: unknown;
    };

export function FormatData({ data, language, className }: { data?: Data; language: string; className?: string }) {
  if (!data) {
    return <span className={className}>-</span>;
  }

  switch (data.type) {
    case 'url':
      return (
        <ExternalLink href={data.value} className={className}>
          {data.value}
        </ExternalLink>
      );
    case 'datetime':
      return (
        <time dateTime={data.value} className={className}>
          {formatDateTimeWithoutPresets(data.value, {
            language,
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </time>
      );
    case 'number':
      return <span className={className}>{formatNumber(data.value, { language })}</span>;
    case 'unknown':
      return <span className={className}>{data.value ? String(data.value) : '-'}</span>;
  }
}
