import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BarChart3,
  Calendar,
  DollarSign,
  LineChart as LineChartIcon,
  PieChart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { BudgetTrendData, MonthlyTrend } from '../types/dashboard';

interface BudgetTrendChartProps {
  data: BudgetTrendData;
}

export const BudgetTrendChart: React.FC<BudgetTrendChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [activeRange, setActiveRange] = useState<'6m' | '3m'>('6m');

  const chartData = activeRange === '3m' ? data.trends.slice(-3) : data.trends;

  // Custom Arabic Tooltip for recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const monthData: MonthlyTrend = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs font-['Cairo',sans-serif] text-right min-w-[200px] dir-rtl">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 mb-2">
            <span className="font-extrabold text-sky-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{monthData?.month || label}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">
              معدل الصرف: {monthData?.burnRate}
            </span>
          </div>

          <div className="space-y-2">
            {/* Actual Expenses */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-300">المصروفات الفعلية:</span>
              </div>
              <span className="font-extrabold text-blue-400 tabular-nums">
                {monthData?.actualExpenses} مليون ج.م
              </span>
            </div>

            {/* Remaining Budget */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-slate-300">الميزانية المتبقية:</span>
              </div>
              <span className="font-extrabold text-red-400 tabular-nums">
                {monthData?.remainingBudget} مليون ج.م
              </span>
            </div>

            {/* Total Budget Ratio */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>نسبة الصرف التراكمي:</span>
              <span className="font-bold text-emerald-400 tabular-nums">
                {((monthData?.actualExpenses / monthData?.totalBudget) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 border border-sky-100 shadow-sm mb-4">
      {/* Top Header of Data Visualization */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <LineChartIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 text-sm md:text-base">
              تحليل الميزانية والمصروفات الفعلية للمشاريع
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              تطور الميزانية المتبقية مقابل المصروفات التراكمية على مدار الـ 6 أشهر الماضية
            </p>
          </div>
        </div>

        {/* View Switchers & Time Range */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {/* Range: 3M vs 6M */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveRange('6m')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeRange === '6m' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 أشهر
            </button>
            <button
              onClick={() => setActiveRange('3m')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                activeRange === '3m' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3 أشهر
            </button>
          </div>

          {/* Chart Type: Area vs Line vs Bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setChartType('area')}
              title="مخطط مساحي"
              className={`p-1.5 rounded-lg font-bold transition-colors ${
                chartType === 'area' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LineChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              title="مخطط خطي"
              className={`p-1.5 rounded-lg font-bold transition-colors ${
                chartType === 'line' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="مخطط أعمدة مقارنة"
              className={`p-1.5 rounded-lg font-bold transition-colors ${
                chartType === 'bar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mini Highlights Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 text-xs">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي العقود</span>
            <span className="text-sm font-extrabold text-slate-800 tabular-nums">
              1,250 <span className="text-[10px] text-slate-500 font-normal">مليون ج.م</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-700 block">المصروفات الفعلية الحالية</span>
            <span className="text-sm font-extrabold text-blue-700 tabular-nums">
              870 <span className="text-[10px] font-normal">مليون ج.م (69.6%)</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-red-50/60 p-2.5 rounded-xl border border-red-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-red-700 block">الميزانية المتبقية</span>
            <span className="text-sm font-extrabold text-red-600 tabular-nums">
              380 <span className="text-[10px] font-normal">مليون ج.م (30.4%)</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 block">متوسط الصرف الشهري</span>
            <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
              ~72 <span className="text-[10px] font-normal">مليون / شهر</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                unit=" م"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
                formatter={(value) => (value === 'actualExpenses' ? 'المصروفات الفعلية' : 'الميزانية المتبقية')}
              />
              <Area
                type="monotone"
                dataKey="actualExpenses"
                name="actualExpenses"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#expensesGradient)"
                activeDot={{ r: 6, stroke: '#1d4ed8', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Area
                type="monotone"
                dataKey="remainingBudget"
                name="remainingBudget"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#budgetGradient)"
                activeDot={{ r: 6, stroke: '#b91c1c', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          ) : chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                unit=" م"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
                formatter={(value) => (value === 'actualExpenses' ? 'المصروفات الفعلية' : 'الميزانية المتبقية')}
              />
              <Line
                type="monotone"
                dataKey="actualExpenses"
                name="actualExpenses"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#1d4ed8', strokeWidth: 2, fill: '#2563eb' }}
              />
              <Line
                type="monotone"
                dataKey="remainingBudget"
                name="remainingBudget"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4, stroke: '#ef4444', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 7, stroke: '#b91c1c', strokeWidth: 2, fill: '#ef4444' }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis
                unit=" م"
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                domain={[0, 1000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="left"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
                formatter={(value) => (value === 'actualExpenses' ? 'المصروفات الفعلية' : 'الميزانية المتبقية')}
              />
              <Bar dataKey="actualExpenses" name="actualExpenses" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="remainingBudget" name="remainingBudget" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
