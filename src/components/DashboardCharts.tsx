"use client";
import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export function FinanceTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} tickFormatter={(v) => `₹${v/100000}L`} />
        <Tooltip 
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
        <Area type="monotone" dataKey="expenses" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ConstructionBarChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 30, right: 30, top: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis 
          dataKey="site" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{fill: '#475569', fontSize: 11, fontWeight: 700}}
          width={100}
        />
        <Tooltip 
          cursor={{fill: '#f8fafc'}}
          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}
          formatter={(value: any) => [`${value}%`, 'Progress']}
        />
        <Bar 
          dataKey="progress" 
          fill="#f59e0b" 
          radius={[0, 4, 4, 0]} 
          barSize={12}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
