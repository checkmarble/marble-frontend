import { useMemo, useState } from 'react';
import { toggle } from 'radash';
import { Button, RadioGroup, RadioGroupItem } from 'ui-design-system';
import clsx from 'clsx';
import {
  entries,
  unique,
  groupBy,
  mapValues,
  omit,
  sumBy,
  omitBy,
} from 'remeda';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

type Item<T extends string> = { version: string; count: number; option: T };
type Type = 'absolute' | 'percentage';
type Summary<T extends string> = { total: number } & Partial<Record<T, number>>;
export type Versions = { ref: string; test: string };
type Mapping<T extends string> = Record<
  T,
  {
    background: string;
    border: string;
    text: string;
    name: string;
  }
>;

function SanKey<T extends string>({
  version,
  summary,
  type,
  legend,
  mapping,
}: {
  version: string;
  type: Type;
  summary: Summary<T>;
  legend: T[];
  mapping: Mapping<T>;
}) {
  const pairs = useMemo(
    () =>
      entries(omit(summary, ['total'])).filter(([status]) =>
        legend.includes(status as T),
      ),
    [summary, legend],
  );

  return (
    <div className="flex size-full flex-col items-center gap-4">
      <span className="text-xs font-medium uppercase">{version}</span>
      <div className="flex size-full flex-col gap-1">
        {pairs.length === 0 ? (
          <div className="border-grey-10 size-full rounded-lg border-2" />
        ) : (
          pairs.map(([status, count]) => (
            <div
              key={status}
              style={{
                flexBasis: `${Math.round(((count as number) * 100) / summary.total)}%`,
              }}
              className={clsx(
                'flex min-h-[24px] w-full shrink grow flex-row items-center justify-center rounded-[4px]',
                mapping[status as T].background,
              )}
            >
              <span
                className={clsx(
                  'text-s font-medium',
                  mapping[status as T].text,
                )}
              >
                {type === 'percentage'
                  ? `${Math.round(((count as number) * 100) / summary.total)}%`
                  : count}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function HamburgerChart<T extends string>({
  items,
  versions: { ref, test },
  mapping,
}: {
  items: Item<T>[];
  versions: Versions;
  mapping: Mapping<T>;
}) {
  const { t } = useTranslation(['scenarios', 'decisions']);

  const options = useMemo(() => unique(items.map((i) => i.option)), [items]);

  const [type, setTytpe] = useState<Type>('percentage');
  const [legend, updateLegend] = useState(options);

  const summaryByVersions = useMemo(
    () =>
      mapValues(
        groupBy(items, (i) => i.version),
        (itemsByVersion) => ({
          total: sumBy(itemsByVersion as Item<T>[], (d) => d.count),
          ...omitBy(
            mapValues(
              groupBy(itemsByVersion, (d) => d.option),
              (itemsByOption) =>
                sumBy(itemsByOption as Item<T>[], (d) => d.count),
            ),
            (count) => count === 0,
          ),
        }),
      ),
    [items],
  );

  return (
    <div className="flex flex-col gap-8">
      <RadioGroup onValueChange={(type) => setTytpe(type as Type)} value={type}>
        <RadioGroupItem value="absolute">
          {t('scenarios:testrun.distribution.absolute')}
        </RadioGroupItem>
        <RadioGroupItem value="percentage">
          {t('scenarios:testrun.distribution.percentage')}
        </RadioGroupItem>
      </RadioGroup>
      <div className="flex h-60 w-full flex-row items-center justify-center gap-4 px-8">
        <SanKey
          type={type}
          legend={legend}
          version={ref}
          summary={summaryByVersions[ref] as Summary<T>}
          mapping={mapping}
        />
        <Icon icon="arrow-forward" className="text-grey-100 h-4" />
        <SanKey
          type={type}
          legend={legend}
          version={test}
          summary={summaryByVersions[test] as Summary<T>}
          mapping={mapping}
        />
      </div>
      <div className="flex flex-row justify-center gap-2 px-24">
        {options.map((option) => (
          <Button
            variant="tertiary"
            key={option}
            className="text-grey-100 gap-3"
            onClick={() => updateLegend((prev) => toggle(prev, option))}
          >
            <div
              className={clsx('size-4 rounded-[4px]', {
                [`${mapping[option].border} border-2`]:
                  !legend.includes(option),
                [mapping[option].background]: legend.includes(option),
              })}
            />
            <span>{mapping[option].name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
