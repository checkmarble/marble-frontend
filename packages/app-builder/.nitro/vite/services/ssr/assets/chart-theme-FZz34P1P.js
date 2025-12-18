const nivoTheme = {
  text: { fill: "var(--color-grey-secondary)" },
  axis: { ticks: { text: { fill: "var(--color-grey-secondary)" } } },
  legends: { text: { fill: "var(--color-grey-secondary)" } },
  grid: {
    line: {
      stroke: "var(--color-grey-border)",
      strokeWidth: 1,
      strokeDasharray: "4 4"
    }
  }
};
const tooltipStyle = "flex flex-col gap-xs bg-surface-card px-md py-sm rounded-lg border border-grey-border shadow-md min-w-52 w-max whitespace-nowrap";
function formatChartNumber(value, language) {
  return new Intl.NumberFormat(language, {
    maximumFractionDigits: 1
  }).format(value);
}
const CASE_ANALYTICS_COLORS = {
  secondary: "var(--color-blue-58)",
  success: "var(--color-green-primary)",
  // New tokens added for the Figma design pass
  yellow: "var(--color-yellow-primary)",
  orange: "var(--color-orange-primary)",
  red: "var(--color-red-secondary)",
  green: "var(--color-green-secondary)",
  purpleLight: "var(--color-purple-secondary)"
};
const BAR_BORDER_RADIUS = 6;
const BAR_BORDER_WIDTH = 1;
function buildBarGradient(colorVar, id) {
  return {
    id,
    type: "linearGradient",
    colors: [
      { offset: 0, color: colorVar, opacity: 0.8 },
      { offset: 100, color: colorVar, opacity: 0.15 }
    ]
  };
}
const DEFAULT_Y_TICKS = [0, 200, 400, 600, 800, 1e3];
function getNiceYAxisTicks(values) {
  if (values.length === 0) return DEFAULT_Y_TICKS;
  const maxValue = Math.max(...values);
  if (maxValue === 0) return DEFAULT_Y_TICKS;
  const highestPow10Divider = Math.max(10, Math.pow(10, Math.floor(Math.log10(maxValue))));
  const lastTickValue = Math.ceil(maxValue / highestPow10Divider) * highestPow10Divider;
  return Array.from({ length: 6 }, (_, i) => lastTickValue / 5 * i);
}
function formatPeriodTick(period, language, isSameYear) {
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarterMatch) {
    const [, year, q] = quarterMatch;
    return isSameYear ? `Q${q}` : `Q${q} ${year}`;
  }
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const date2 = new Date(Number(year), Number(month) - 1, 1);
    return date2.toLocaleDateString(language, {
      month: "short",
      year: isSameYear ? void 0 : "numeric"
    });
  }
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(language, {
    day: "numeric",
    month: "short",
    year: isSameYear ? void 0 : "numeric"
  });
}
function formatPeriodTooltip(period, language) {
  const quarterMatch = /^(\d{4})-Q([1-4])$/.exec(period);
  if (quarterMatch) {
    const [, year, q] = quarterMatch;
    return `Q${q} ${year}`;
  }
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(period);
  if (monthMatch) {
    const [, year, month] = monthMatch;
    const date2 = new Date(Number(year), Number(month) - 1, 1);
    return date2.toLocaleDateString(language, { month: "long", year: "numeric" });
  }
  const date = new Date(period);
  if (Number.isNaN(date.getTime())) return period;
  return date.toLocaleDateString(language, { day: "numeric", month: "long", year: "numeric" });
}
function getXTickValues(data, indexBy) {
  if (data.length === 0) return [];
  const values = data.map((d) => String(d[indexBy]));
  if (values.length <= 8) return values;
  const step = Math.ceil(values.length / 8);
  const picked = values.filter((_, i) => i % step === 0);
  const last = values[values.length - 1];
  if (last && picked[picked.length - 1] !== last) picked.push(last);
  return picked;
}
function isSamePeriodYear(periods) {
  if (periods.length === 0) return true;
  const years = new Set(periods.map((p) => p.slice(0, 4)));
  return years.size === 1;
}
function formatBracket(bracket, t) {
  switch (bracket) {
    case "0-2":
      return t("cases:analytics.chart.bracket.0_2");
    case "3-10":
      return t("cases:analytics.chart.bracket.3_10");
    case "11-30":
      return t("cases:analytics.chart.bracket.11_30");
    case "31+":
      return t("cases:analytics.chart.bracket.over_30");
    default:
      return bracket;
  }
}
export {
  BAR_BORDER_WIDTH as B,
  CASE_ANALYTICS_COLORS as C,
  BAR_BORDER_RADIUS as a,
  buildBarGradient as b,
  getNiceYAxisTicks as c,
  formatChartNumber as d,
  formatPeriodTick as e,
  formatPeriodTooltip as f,
  getXTickValues as g,
  formatBracket as h,
  isSamePeriodYear as i,
  nivoTheme as n,
  tooltipStyle as t
};
