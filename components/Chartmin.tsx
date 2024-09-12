import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import Color from '@/public/colors';
import '@/app/(main)/style.scss';
import { borderRadius, display } from '@mui/system';

interface ChartProps {
    batteryData: number[];
}

const Chartmin = React.memo<ChartProps>(({ batteryData }) => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        // console.log("what?",batteryData);
        const timeLabels = batteryData.map((_, index) => '');  // 10분 간격의 레이블 생성
        const batteryValues = batteryData;

        // Chart에 사용할 데이터 설정
        const data = {
            labels: timeLabels,
            datasets: [
                {
                    label: '',
                    data: batteryValues,
                    fill: true,
                    backgroundColor: '#CFF1D8',
                    borderColor: Color.good,
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                }
            ]
        };

        setChartData(data);
    }, [batteryData]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
        },
        layout:{
            padding: 0,
        },
        animation:{
            duration: 0,
        },
        scales: {
            x: {
                beginAtZero:true,
                display:false
                // title: {
                //     display: false
                // },
            },
            y: {
                beginAtZero:true,
                display:false,
                min: 0,
                max: 70
                // title: {
                //     display: false
                // },
                // min: 0,
                // max: 100,
            }
        }
    };

    return (
        <Chart  className='custom-chart' type="line" data={chartData} options={options} />
    );
}, (prevProps, nextProps) => {
    return prevProps.batteryData === nextProps.batteryData; // data가 같으면 리렌더링 방지
  });


export default Chartmin;