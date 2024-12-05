import { Page, useOutcomes } from '@app-builder/components';
import { type Outcome } from '@app-builder/models/outcome';
import clsx from 'clsx';
import * as d3 from 'd3';
import { type Namespace } from 'i18next';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import useMeasure from 'react-use-measure';
import { Icon, iconsSVGSpriteHref } from 'ui-icons';

export const handle = {
  i18n: ['common', 'navigation', 'api', 'decisions'] satisfies Namespace,
};

export default function D3() {
  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center">
          <Icon icon="helpcenter" className="mr-2 size-6" />
          <span className="line-clamp-1 text-start">Test D3</span>
        </div>
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <Chart entries={entries} />
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

type Data = {
  nodes: { version: string; outcome: Outcome; count: number }[];
  links: [];
};

const entries: Data = {
  nodes: [
    { version: 'v1', outcome: 'approve', count: 10 },
    { version: 'v2', outcome: 'approve', count: 20 },
    { version: 'v1', outcome: 'decline', count: 5 },
    { version: 'v2', outcome: 'decline', count: 15 },
    { version: 'v1', outcome: 'review', count: 9 },
    { version: 'v2', outcome: 'review', count: 22 },
    { version: 'v1', outcome: 'block_and_review', count: 20 },
  ],
  links: [],
};

function Chart({ entries }: { entries: Data }) {
  const [ref, bounds] = useMeasure();
  const { t } = useTranslation(['decisions']);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative size-full h-[500px]" ref={ref}>
        {bounds.width > 0 ? (
          <ChartInner
            data={entries.nodes}
            width={bounds.width}
            height={bounds.height}
          />
        ) : null}
      </div>
      <div className="flex w-full flex-wrap items-center justify-center gap-6">
        {orderredOutcomes.map((outcome) => (
          <div key={outcome} className="inline-flex items-center gap-2">
            <svg
              className={clsx('size-4 shrink-0 rounded', outcomeColor[outcome])}
            >
              <rect
                width="100%"
                height="100%"
                rx={4}
                ry={4}
                fill="currentColor"
                className={outcomeColor[outcome]}
              />
            </svg>
            <span className="text-s text-grey-100 font-medium">
              {t(`decisions:outcome.${outcome}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const orderredOutcomes: Outcome[] = [
  'decline',
  'block_and_review',
  'review',
  'approve',
];

const outcomeColor = {
  approve: 'text-green-100',
  decline: 'text-red-100',
  review: 'text-yellow-100',
  block_and_review: 'text-orange-100',
  unknown: 'text-grey-100',
};

function ChartInner({
  data,
  width,
  height,
}: {
  data: Data['nodes'];
  width: number;
  height: number;
}) {
  const margin = {
    top: 37,
    right: 0,
    bottom: 0,
    left: 0,
  };
  const gap = 4;

  const foo = d3.index(
    data,
    (d) => d.version,
    (d) => d.outcome,
  );

  // Determine the series that need to be stacked.
  const series = d3
    .stack<[string, d3.InternMap<Outcome, Data['nodes'][number]>], Outcome>()
    .offset(d3.stackOffsetExpand)
    .keys(orderredOutcomes)
    .order(d3.stackOrderNone)
    .value(([, D], key) => {
      return D.get(key)?.count ?? 0;
    })(foo);

  // Prepare the scales for positional and color encodings.
  const xScale = d3
    .scaleBand()
    .domain(d3.union(data.map((d) => d.version)))
    .range([margin.left, width - margin.right])
    .paddingInner(0.1);

  const versionOptions = new Map(
    foo.entries().map(([version, value]) => {
      const outcomes = d3.sort(
        value.keys(),
        (outcome) => -orderredOutcomes.indexOf(outcome),
      );
      const outcomeOffset = new Map(
        outcomes.map((outcome, i) => [outcome, i * gap]),
      );
      const numberOfOutcomes = Object.keys(outcomes).length;

      return [
        version,
        {
          outcomeOffset,
          yScale: d3
            .scaleLinear()
            .domain([0, 1])
            .range([
              height - (numberOfOutcomes - 1) * gap - margin.bottom,
              margin.top,
            ]),
        },
      ];
    }),
  );

  return (
    <svg className="border" viewBox={`0 0 ${width} ${height}`}>
      {/* Vi Labels */}
      {xScale.domain().map((xi, i) => (
        <g
          key={xi}
          transform={`translate(${xScale.step() * i + xScale.bandwidth() / 2},5)`}
        >
          <text
            className="text-grey-100 text-s font-medium capitalize"
            textAnchor="middle"
            alignmentBaseline="text-before-edge"
            fill="currentColor"
          >
            {xi}
          </text>
        </g>
      ))}

      <use
        href={`${iconsSVGSpriteHref}#arrow-right`}
        height={40}
        width={40}
        x={(width + margin.left - margin.right - 40) / 2}
        y={(height + margin.top - margin.bottom - 40) / 2}
      />

      {/* Histogram for v1 data */}
      {series.map((outcomeSerie) => {
        const outcome = outcomeSerie.key;
        return (
          <React.Fragment key={outcome}>
            {outcomeSerie.map((d) => {
              const version = d.data[0];

              const percentValue = Math.round((d[1] - d[0]) * 100);
              if (percentValue === 0) return null;

              const options = versionOptions.get(version);
              if (!options) return null;

              const { outcomeOffset, yScale } = options;
              const x = xScale(version);
              const yOffset = outcomeOffset.get(outcome) ?? 0;
              const y = yScale(d[1]) + yOffset;
              const width = xScale.bandwidth();
              const height = yScale(d[0]) - yScale(d[1]);

              return (
                <g
                  key={version}
                  className={outcomeColor[outcome]}
                  fill="currentColor"
                  transform={`translate(${x},${y})`}
                >
                  <rect width={width} height={height} rx={4} ry={4}>
                    <title>{`${percentValue}%`}</title>
                  </rect>

                  {/* Empiric value based on the text size */}
                  {height > 15 ? (
                    <text
                      x={width / 2}
                      y={height / 2}
                      textAnchor="middle"
                      alignmentBaseline="central"
                      className="text-s text-grey-00 font-medium"
                      fill="currentColor"
                    >{`${percentValue}%`}</text>
                  ) : null}
                </g>
              );
            })}
          </React.Fragment>
        );
      })}
    </svg>
  );
}
