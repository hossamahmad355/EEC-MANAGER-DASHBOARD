import React from 'react';
import {
  Coins,
  HardHat,
  Network,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Users,
} from 'lucide-react';
import { DashboardData } from '../types/dashboard';

interface KpiBarProps {
  kpis: DashboardData['kpis'];
  onCardClick?: (metricKey: string) => void;
}

export const KpiBar: React.FC<KpiBarProps> = ({ kpis, onCardClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-4">
      {/* 1. إجمالي الموظفين */}
      <div
        onClick={() => onCardClick?.('employees')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          <Users className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            إجمالي الموظفين
          </p>
          <p className="text-xl font-extrabold text-slate-800 tabular-nums">
            {kpis.totalEmployees}
          </p>
        </div>
      </div>

      {/* 2. إجمالي المواقع */}
      <div
        onClick={() => onCardClick?.('sites')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
          <Network className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            إجمالي المواقع
          </p>
          <p className="text-xl font-extrabold text-slate-800 tabular-nums">
            {kpis.totalSites}
          </p>
        </div>
      </div>

      {/* 3. إجمالي المشاريع */}
      <div
        onClick={() => onCardClick?.('projects')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
          <HardHat className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            إجمالي المشاريع
          </p>
          <p className="text-xl font-extrabold text-slate-800 tabular-nums">
            {kpis.totalProjects}
          </p>
        </div>
      </div>

      {/* 4. نسبة الإنجاز العامة */}
      <div
        onClick={() => onCardClick?.('completion')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            نسبة الإنجاز العامة
          </p>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 inline" />
              <span>{kpis.completionRateTrend}</span>
            </span>
            <span className="text-xl font-extrabold text-slate-800 tabular-nums">
              {kpis.overallCompletionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 5. إجمالي قيمة العقود */}
      <div
        onClick={() => onCardClick?.('contracts')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          <Coins className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            إجمالي قيمة العقود
          </p>
          <p className="text-sm md:text-base font-extrabold text-slate-800 tabular-nums whitespace-nowrap">
            1,250,000,000 <span className="text-xs font-semibold text-slate-500">ج.م</span>
          </p>
        </div>
      </div>

      {/* 6. التكلفة الفعلية */}
      <div
        onClick={() => onCardClick?.('actual_cost')}
        className="bg-white rounded-2xl p-3 border border-sky-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
          {/* Bar Chart icon */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="7" width="4" height="14" rx="1" />
            <rect x="17" y="3" width="4" height="18" rx="1" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            التكلفة الفعلية
          </p>
          <p className="text-xs md:text-sm font-extrabold text-slate-800 tabular-nums whitespace-nowrap">
            870,000,000 <span className="text-[10px] font-semibold text-slate-500">ج.م</span>
          </p>
          <p className="text-[10px] font-bold text-slate-500 tabular-nums">
            ({kpis.actualCostPercentage}%)
          </p>
        </div>
      </div>

      {/* 7. المتبقي من الميزانية */}
      <div
        onClick={() => onCardClick?.('remaining_budget')}
        className="bg-white rounded-2xl p-3 border border-red-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
      >
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
          <PieChart className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            المتبقي من الميزانية
          </p>
          <p className="text-xs md:text-sm font-extrabold text-red-600 tabular-nums whitespace-nowrap">
            380,000,000 <span className="text-[10px] font-semibold text-slate-500">ج.م</span>
          </p>
          <p className="text-[10px] font-bold text-red-500 tabular-nums">
            ({kpis.remainingBudgetPercentage}%)
          </p>
        </div>
      </div>
    </div>
  );
};
