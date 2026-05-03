import React from 'react';

export interface PieChartData {
  name: string;
  value: number; // 비중 (%)
  color: string;
}

interface Props {
  data: PieChartData[];
  totalAmount: number; // 현재 입력된 총 비중 (최대 100)
}

const DonutChart: React.FC<Props> = ({ data, totalAmount }) => {
  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;

  // 100% 미만일 경우 회색의 '미입력' 영역 추가[cite: 26]
  const chartData = [...data];
  if (totalAmount < 100) {
    chartData.push({ name: '미입력', value: 100 - totalAmount, color: '#555555' });
  }

  return (
    <div className="relative flex justify-center items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {chartData.map((item, index) => {
          const strokeDasharray = `${(item.value / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -currentOffset;
          currentOffset += (item.value / 100) * circumference;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-in-out"
            />
          );
        })}
      </svg>
      {/* 중앙 텍스트 영역 */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-main-text/60 text-[12px] font-bold">총 비중</span>
        <span className="text-main-text font-bold text-[24px]">{totalAmount}%</span>
      </div>
    </div>
  );
};

export default DonutChart;