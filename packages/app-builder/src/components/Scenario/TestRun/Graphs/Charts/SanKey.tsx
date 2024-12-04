import { ComponentProps, useEffect, useRef } from 'react';
import { createChart, CrosshairMode, type IChartApi } from 'lightweight-charts';

export const SanKey = (props: ComponentProps<'div'>) => {
  const container = useRef<HTMLDivElement>(null);
  let chart: IChartApi;

  useEffect(() => {
    if (container.current) {
      chart = createChart(container.current, {
        autoSize: true,
        handleScroll: false,
        handleScale: false,
        layout: {
          background: { color: 'transparent' },
          attributionLogo: false,
        },
        timeScale: { visible: false },
        rightPriceScale: { visible: false },
        crosshair: {
          mode: CrosshairMode.Hidden,
          vertLine: { visible: false },
          horzLine: { visible: false },
        },
        grid: {
          horzLines: { visible: false },
          vertLines: { visible: false },
        },
      });

      const newSeries = chart.addLineSeries({
        priceLineVisible: false,
      });

      newSeries.setData([
        { time: '2018-12-22', value: 32.51 },
        { time: '2018-12-23', value: 31.11 },
        { time: '2018-12-24', value: 27.02 },
        { time: '2018-12-25', value: 27.32 },
        { time: '2018-12-26', value: 25.17 },
        { time: '2018-12-27', value: 28.89 },
        { time: '2018-12-28', value: 25.46 },
        { time: '2018-12-29', value: 23.92 },
        { time: '2018-12-30', value: 22.68 },
        { time: '2018-12-31', value: 22.67 },
      ]);
    }

    return () => {
      chart.remove();
    };
  }, []);

  return <div {...props} ref={container}></div>;
};
