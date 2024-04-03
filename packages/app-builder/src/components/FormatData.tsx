import { formatDateTime, formatNumber } from '@app-builder/utils/format';

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

export function FormatData({
  data,
  language,
}: {
  data: Data;
  language: string;
}) {
  switch (data.type) {
    case 'url':
      return <ExternalLink href={data.value}>{data.value}</ExternalLink>;
    case 'datetime':
      return (
        <time dateTime={data.value}>
          {formatDateTime(data.value, { language })}
        </time>
      );
    case 'number':
      return <span>{formatNumber(data.value, { language })}</span>;
    case 'unknown':
      return <span>{data.value ? String(data.value) : '-'}</span>;
  }
}
