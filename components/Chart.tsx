import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { RealTimeScale, StreamingPlugin } from 'chartjs-plugin-streaming';
import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';

Chart.register(
  StreamingPlugin,
  RealTimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ChartLive = ({ cur }) => {
  useEffect(() => {
    console.log(cur);
  }, [cur]);

  return (
    <Line
      data={{
        datasets: [
          {
            label: 'Dataset 1',
            backgroundColor: 'rgba(255, 99, 132,1)',
            borderColor: 'rgb(255, 99, 132)',
            // borderDash: [8, 4],
            fill: true,
            data: [],
          },
        ],
      }}
      options={{
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            type: 'realtime',
            realtime: {
              delay: 2000,
              onRefresh: (chart) => {
                chart.data.datasets.forEach((dataset) => {
                  dataset.data.push({
                    x: Date.now(),
                    y: cur,
                  });
                });
              },
            },
          },
          y: {
            min: 0,

            //     max: 0.3
          },
        },
      }}
    />
  );
};

export default ChartLive;
