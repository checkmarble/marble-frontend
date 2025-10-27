import { Spinner } from '@app-builder/components/Spinner';
import { type RuleCoOccurrenceMatrixResponse } from '@app-builder/models/analytics/rule-co-occurence-matrix';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

type HeatmapRow = {
  id: string; // Row label: rule name
  // dynamic column keys: "1", "2", ...
  [key: string]: string | number | null;
};

export function RuleCoOccurrenceMatrix({
  data,
  isLoading = false,
}: {
  data: RuleCoOccurrenceMatrixResponse[];
  isLoading?: boolean;
}) {
  const { t } = useTranslation(['analytics']);

  const { rows, keys, colKeyToRuleId, ruleIdToName, minValue, maxValue } = useMemo(() => {
    const ruleIdToNameMap = new Map<string, string>();
    for (const d of data ?? []) {
      if (d.ruleX) ruleIdToNameMap.set(d.ruleX, d.ruleXName);
      if (d.ruleY) ruleIdToNameMap.set(d.ruleY, d.ruleYName);
    }
    const orderedRuleIds = Array.from(ruleIdToNameMap.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id]) => id);

    const colKeys = orderedRuleIds.map((_, idx) => String(idx + 1));
    const colKeyToRuleIdMap = new Map<string, string>();
    orderedRuleIds.forEach((ruleId, idx) => colKeyToRuleIdMap.set(String(idx + 1), ruleId));

    const pairToValue = new Map<string, number>();
    for (const d of data ?? []) {
      pairToValue.set(`${d.ruleX}__${d.ruleY}`, d.hits);
      pairToValue.set(`${d.ruleY}__${d.ruleX}`, d.hits);
    }

    const outRows: HeatmapRow[] = orderedRuleIds.map((rowRuleId, rowIdx) => {
      const row: HeatmapRow = { id: ruleIdToNameMap.get(rowRuleId) ?? rowRuleId };
      colKeys.forEach((colKey, colIdx) => {
        const colRuleId = colKeyToRuleIdMap.get(colKey)!;
        // Only fill upper triangle including diagonal to mirror the wireframe
        if (colIdx < rowIdx) {
          row[colKey] = null;
        } else if (rowRuleId === colRuleId) {
          row[colKey] = 1;
        } else {
          const v = pairToValue.get(`${rowRuleId}__${colRuleId}`);
          row[colKey] = typeof v === 'number' ? v : null;
        }
      });
      return row;
    });

    // Compute bounds from present numeric values
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const r of outRows) {
      for (const key of colKeys) {
        const val = r[key];
        if (typeof val === 'number') {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 1;

    return {
      rows: outRows,
      keys: colKeys,
      colKeyToRuleId: colKeyToRuleIdMap,
      ruleIdToName: ruleIdToNameMap,
      minValue: min,
      maxValue: max,
    };
  }, [data]);

  const handleExportCsv = () => {
    if (!rows.length) return;
    const header = ['Rule', ...keys];
    const lines = rows.map((r) =>
      [
        String(r.id),
        ...keys.map((k) => {
          const v = r[k];
          return typeof v === 'number' ? v.toString() : '';
        }),
      ].join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8,' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rule_co_occurrence_matrix.csv`;
    document.body.appendChild(a);
    a.click();
  };

  return (
    <div className="mt-v2-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 font-semibold">
          {t('analytics:rulecooccurrence.title', 'Correlation of rule hits')}
        </h2>
        <ButtonV2
          variant="secondary"
          className="flex items-center gap-v2-sm"
          disabled={isLoading || rows.length === 0}
          onClick={handleExportCsv}
        >
          <Icon icon="download" className="size-4" />
          {t('analytics:decisions.export.button', 'Export CSV')}
        </ButtonV2>
      </div>

      <div
        aria-busy={isLoading}
        className="bg-white border border-grey-90 rounded-lg p-v2-md shadow-sm mt-v2-sm relative"
      >
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-grey-98/80 hover:bg-grey-95/80">
            <Spinner className="size-6" />
          </div>
        ) : null}
        <div className="flex w-full h-[560px] flex-col items-start gap-v2-md">
          <div className="flex-1 w-full">
            <ResponsiveHeatMap
              data={rows as any}
              keys={keys}
              indexBy="id"
              margin={{ top: 28, right: 8, bottom: 24, left: 260 }}
              minValue={minValue}
              maxValue={maxValue}
              forceSquare={true}
              colors={{ type: 'sequential', scheme: 'purples' }}
              emptyColor="#F3F4F6"
              nanColor="#F3F4F6"
              borderWidth={1}
              borderColor="#F3F4F6"
              enableGridX={false}
              enableGridY={false}
              labelTextColor="#111827"
              axisTop={{
                tickSize: 0,
                tickPadding: 6,
                tickRotation: 0,
                format: (value: string | number) => String(value),
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 6,
                tickRotation: 0,
                truncateTickAt: 60,
              }}
              legends={[]}
              tooltip={(args: {
                xKey: string | number;
                yKey: string | number;
                cell: { value: number | null };
              }) => {
                const { xKey, yKey, cell } = args;
                const colRuleId = colKeyToRuleId.get(String(xKey));
                const colName = colRuleId
                  ? (ruleIdToName.get(colRuleId) ?? String(xKey))
                  : String(xKey);
                return (
                  <div className="flex flex-col gap-v2-xs w-auto max-w-max bg-white p-v2-sm rounded-lg border border-grey-90 shadow-sm whitespace-nowrap">
                    <div className="text-s text-grey-60">
                      {String(yKey)} × {colName}
                    </div>
                    <div className="text-m font-semibold text-grey-00">
                      {typeof cell.value === 'number' ? cell.value.toFixed(1) : '-'}
                    </div>
                  </div>
                );
              }}
              label={(cell: { value: number | null }) =>
                typeof cell.value === 'number' ? cell.value.toFixed(1) : ''
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RuleCoOccurrenceMatrix;
