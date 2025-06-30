import { type ScenarioIterationWithType } from '@app-builder/models/scenario/iteration';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { toggle } from 'radash';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { groupBy, keys, mapValues, omitBy, sumBy, unique } from 'remeda';
import { Button, RadioGroup, RadioGroupItem, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

type Item<T extends string> = { version: string; count: number; option: T };
type Type = 'absolute' | 'percentage';
type Summary<T extends string> = { total: number } & Partial<Record<T, number>>;
export type Versions = {
  ref: { value: string; type: ScenarioIterationWithType['type'] };
  test: { value: string; type: ScenarioIterationWithType['type'] };
};
type Mapping<T extends string> = Record<
  T,
  {
    background: string;
    border: string;
    text: string;
    name: string;
  }
>;

export function Hamburger<T extends string>({
  version,
  summary,
  type,
  legend,
  mapping,
}: {
  version: Versions['ref' | 'test'];
  type: Type;
  summary: Summary<T>;
  legend: T[];
  mapping: Mapping<T>;
}) {
  const language = useFormatLanguage();
  const { t } = useTranslation(['common']);

  const pairs = useMemo(() => {
    const result: [T, number][] = [];

    for (const status of legend) {
      if (summary[status] !== undefined) result.push([status, summary[status]]);
    }

    return result;
  }, [summary, legend]);

  return (
    <div className="flex size-full flex-col items-center gap-4">
      <Tag size="big" color="grey-light" className="border-grey-90 gap-1 border px-4 py-2">
        <span className="text-grey-00 font-semibold">{`V${version.value}`}</span>
        {version.type === 'live version' ? (
          <span className="text-purple-65 font-semibold">{t('common:live')}</span>
        ) : null}
      </Tag>
      <div className="flex size-full flex-col gap-1">
        {pairs.length === 0 ? (
          <div className="border-grey-90 size-full rounded-lg border-2" />
        ) : (
          pairs.map(([status, count]) => (
            <div
              key={status}
              style={{
                flexBasis: `${Math.round((count * 100) / summary.total)}%`,
              }}
              className={clsx(
                'flex min-h-[24px] w-full shrink grow flex-row items-center justify-center rounded-[4px]',
                mapping[status].background,
              )}
            >
              <span className={clsx('text-s font-medium', mapping[status].text)}>
                {type === 'percentage'
                  ? formatNumber((count * 100) / summary.total / 100, {
                      language,
                      style: 'percent',
                    })
                  : formatNumber(count, {
                      language,
                      compactDisplay: 'short',
                    })}
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

  const options = useMemo(() => {
    const foundOptions = unique(items.map((i) => i.option));
    const orderedOptions: T[] = [];
    for (const option of keys(mapping) as T[]) {
      if (foundOptions.includes(option)) {
        orderedOptions.push(option);
      }
    }
    return orderedOptions;
  }, [items, mapping]);

  const [type, setType] = useState<Type>('percentage');
  const [legend, updateLegend] = useState(options);

  const summaryByVersions = useMemo(() => {
    const result = {
      [ref.value]: {
        total: 0,
      },
      [test.value]: {
        total: 0,
      },
    };

    return {
      ...result,
      ...mapValues(
        groupBy(items, (i) => i.version),
        (itemsByVersion) => ({
          total: sumBy(itemsByVersion as Item<T>[], (d) => d.count),
          ...omitBy(
            mapValues(
              groupBy(itemsByVersion, (d) => d.option),
              (itemsByOption) => sumBy(itemsByOption as Item<T>[], (d) => d.count),
            ),
            (count) => count === 0,
          ),
        }),
      ),
    };
  }, [items, ref, test]);

  return (
    <div className="flex flex-col gap-8">
      <RadioGroup onValueChange={(type) => setType(type as Type)} value={type}>
        <RadioGroupItem value="absolute">
          {t('scenarios:testrun.distribution.absolute')}
        </RadioGroupItem>
        <RadioGroupItem value="percentage">
          {t('scenarios:testrun.distribution.percentage')}
        </RadioGroupItem>
      </RadioGroup>
      <div className="flex h-60 w-full flex-row items-center justify-center gap-4 px-8">
        <Hamburger
          type={type}
          legend={legend}
          version={ref}
          summary={summaryByVersions[ref.value] as Summary<T>}
          mapping={mapping}
        />
        <Icon icon="arrow-forward" className="text-grey-00 h-4" />
        <Hamburger
          type={type}
          legend={legend}
          version={test}
          summary={summaryByVersions[test.value] as Summary<T>}
          mapping={mapping}
        />
      </div>
      <div className="flex flex-row justify-center gap-2 px-24">
        {options.map((option) => (
          <Button
            variant="tertiary"
            key={option}
            className="gap-3"
            onClick={() =>
              updateLegend((prev) => {
                const newLegend = toggle(prev, option);
                const orderedOptions: T[] = [];
                for (const option of keys(mapping) as T[]) {
                  if (newLegend.includes(option)) {
                    orderedOptions.push(option);
                  }
                }
                return orderedOptions;
              })
            }
          >
            <div
              className={clsx('size-4 rounded-[4px]', {
                [`${mapping[option].border} border-2`]: !legend.includes(option),
                [mapping[option].background]: legend.includes(option),
              })}
            />
            <span className="text-grey-00">{mapping[option].name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
