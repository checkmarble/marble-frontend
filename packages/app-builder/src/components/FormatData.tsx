import { formatDateTime, formatNumber } from '@app-builder/utils/format';
import type React from 'react';

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="hover:text-purple-120 focus:text-purple-120 font-semibold lowercase text-purple-100 hover:underline focus:underline"
      target="_blank"
      rel="noreferrer"
      href={href}
    >
      {children}
    </a>
  );
}

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
