import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import Color from '@/public/colors';
import '@/app/(main)/style.scss';
import 'chartjs-adapter-moment';
import { borderRadius, display } from '@mui/system';

export interface Datainfo {
  time: Date;
  value: number;
}
interface ChartProps {
  data: Datainfo[];
}

const Chartmin = React.memo<ChartProps>(
  ({ data }) => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
      // Chart에 사용할 데이터 설정
      const _data = {
        labels: data.map((item) => item.time),
        datasets: [
          {
            label: '',
            data: data.map((item) => item.value),
            fill: true,
            backgroundColor: '#CFF1D8',
            borderColor: Color.good,
            tension: 0,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      };

      setChartData(_data);
    }, [data]);

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      layout: {
        padding: 0,
      },
      animation: {
        duration: 0,
      },
      scales: {
        x: {
          type: 'time', // x축을 시간 타입으로 설정
          time: {
            unit: 'minute', // 시간 단위를 'minute'으로 설정
            tooltipFormat: 'YYYY-MM-DD HH:mm:ss', // 툴팁에 표시할 시간 형식
          },
          title: {
            display: false,
          },
          display: false,
        },
        // x: {
        //     type: 'time' as const,
        //     time: {
        //         unit: 'second'
        //     }
        //     // beginAtZero:true,
        //     // display:false
        //     // title: {
        //     //     display: false
        //     // },
        // },
        y: {
          beginAtZero: true,
          display: false,
          min: 0,
          max: 70,
          // title: {
          //     display: false
          // },
          // min: 0,
          // max: 100,
        },
      },
    };

    return (
      <Chart
        className="custom-chart"
        type="line"
        data={chartData}
        options={options}
      />
    );
  },
  (prevProps, nextProps) => {
    return prevProps.data === nextProps.data; // data가 같으면 리렌더링 방지
  }
);

export default Chartmin;
