import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card px-4 py-3 rounded-xl border border-white/10 shadow-xl">
        <p className="text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-purple-400 font-bold text-lg">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const MonthlyBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No trend data available
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={(str) => {
               const date = new Date(str);
               return `${date.getMonth()+1}/${date.getDate()}`;
            }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
          <Bar 
            dataKey="amount" 
            fill="url(#colorUv)" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
          <defs>
             <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
               <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
               <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
             </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyBarChart;
