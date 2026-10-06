import { formatCount, formatDate, formatDateTime, type SeriesPoint } from '@bo/utils/dashboard-indicator';

type Column = { header: string; points: SeriesPoint[] };

/** Collapsible table twin of the weekly charts: every value, with unknown weeks spelled out. */
export function WeeklyDataTable({ label, columns }: { label: string; columns: Column[] }) {
  const rows = columns[0]?.points ?? [];

  return (
    <details className="text-xs text-grey-secondary">
      <summary className="w-fit cursor-pointer rounded-sm py-xs hover:text-grey-primary">Weekly data</summary>
      <div className="max-h-64 overflow-auto rounded-md border border-grey-border" tabIndex={0}>
        <table className="w-full text-left tabular-nums">
          <caption className="sr-only">{label} by week, UTC</caption>
          <thead>
            <tr className="border-b border-grey-border">
              <th scope="col" className="p-xs font-medium">
                Week (UTC)
              </th>
              {columns.map((column) => (
                <th key={column.header} scope="col" className="p-xs font-medium">
                  {column.header}
                </th>
              ))}
              <th scope="col" className="p-xs font-medium">
                Period
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.start} className="border-b border-grey-border last:border-0">
                <th scope="row" className="p-xs font-normal" title={`Ends ${formatDateTime(row.end)} UTC`}>
                  {formatDate(row.start)}
                </th>
                {columns.map((column) => {
                  const value = column.points[index]?.value ?? null;
                  return (
                    <td key={column.header} className="p-xs">
                      {value === null ? 'Unavailable' : formatCount(value)}
                    </td>
                  );
                })}
                <td className="p-xs">{row.partial ? 'Partial week' : 'Full week'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
