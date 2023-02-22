import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PodLineChart = ({
  backgroundColor,
  data,
  formatter
}: {
  backgroundColor: string;
  data: number[];
  formatter?: string;
}) => {
  const Dom = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();
  const option = useRef({
    xAxis: {
      type: 'category',
      show: false,
      boundaryGap: false,
      data: data.map((_, i) => i)
    },
    yAxis: {
      type: 'value',
      show: false,
      boundaryGap: false
    },
    grid: {
      show: false,
      left: 5,
      right: 5,
      top: 5,
      bottom: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      },
      formatter
    },
    series: [
      {
        data: data,
        type: 'line',
        symbolSize: 6,
        animationDuration: 300,
        animationEasingUpdate: 'linear',
        areaStyle: {
          color: backgroundColor
        },
        lineStyle: {
          color: '#5CB4F3'
        },
        itemStyle: {
          color: '#5CB4F3'
        },
        emphasis: {
          // highlight
          disabled: true
        }
      }
    ]
  });

  useEffect(() => {
    if (!Dom.current) return;
    myChart.current = echarts.init(Dom.current);
    myChart.current && myChart.current.setOption(option.current);
  }, [Dom]);

  // data changed, update
  useEffect(() => {
    if (!myChart.current) return;
    const x = option.current.xAxis.data;
    option.current.xAxis.data = [...x.slice(1), x[x.length - 1] + 1];
    option.current.series[0].data = data;
    myChart.current.setOption(option.current);
  }, [data]);

  return <div ref={Dom} style={{ width: '100%', height: '100%' }} />;
};

export default PodLineChart;
