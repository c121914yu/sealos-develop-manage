import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { printMemory } from '@/utils/tools';
import { useGlobalStore } from '@/store/global';

const PodLineChart = ({
  type,
  cpu = 1000000,
  data
}: {
  type: 'cpu' | 'memory';
  cpu?: number;
  data: number[];
}) => {
  const { screenWidth } = useGlobalStore();

  const Dom = useRef<HTMLDivElement>(null);
  const myChart = useRef<echarts.ECharts>();

  const map = {
    cpu: {
      backgroundColor: '#c9f4e8',
      formatter: (e: any) => `${((e[0].value / cpu) * 100).toFixed(2)}%`
    },
    memory: {
      backgroundColor: '#c9d7f4',
      formatter: (e: any) => printMemory(e[0].value)
    }
  };

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
      formatter: map[type].formatter
    },
    series: [
      {
        data: data,
        type: 'line',
        symbolSize: 6,
        animationDuration: 300,
        animationEasingUpdate: 'linear',
        areaStyle: {
          color: map[type].backgroundColor
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
    if (!Dom.current || myChart?.current?.getOption()) return;
    myChart.current = echarts.init(Dom.current);
    myChart.current && myChart.current.setOption(option.current);
  }, [Dom]);

  // data changed, update
  useEffect(() => {
    if (!myChart.current || !myChart?.current?.getOption()) return;
    const x = option.current.xAxis.data;
    option.current.xAxis.data = [...x.slice(1), x[x.length - 1] + 1];
    option.current.series[0].data = data;
    myChart.current.setOption(option.current);
  }, [data]);

  // resize chart
  useEffect(() => {
    if (!myChart.current || !myChart.current.getOption()) return;
    myChart.current.resize();
  }, [screenWidth]);

  return <div ref={Dom} style={{ width: '100%', height: '100%' }} />;
};

export default PodLineChart;
