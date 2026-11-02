import React from 'react';
import {
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  MapPin,
  Plus,
} from 'lucide-react';
import { Project, Site } from '../types/dashboard';

interface BottomRowProps {
  topProjects: Project[];
  topSites: Site[];
  tasksCounters: {
    pendingApprovals: number;
    openTickets: number;
    maintenanceTasks: number;
    systemUpdates: number;
  };
  onOpenNewProject: () => void;
  onOpenAllProjects: () => void;
  onOpenGantt?: () => void;
  onOpenAllSites: () => void;
  onOpenAllTasks: () => void;
  onToggleSiteConnection: (id: string) => void;
}

export const BottomRow: React.FC<BottomRowProps> = ({
  topProjects,
  topSites,
  tasksCounters,
  onOpenNewProject,
  onOpenAllProjects,
  onOpenGantt,
  onOpenAllSites,
  onOpenAllTasks,
  onToggleSiteConnection,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
      {/* ---------------- 1. CARD: حالة المواقع (الفروع والمشروعات) (col-span-3 or 4) ---------------- */}
      <div className="xl:col-span-4 bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm">
                حالة المواقع (الفروع والمشروعات)
              </h2>
            </div>
            <button
              onClick={onOpenAllSites}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              عرض الكل
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 text-[11px] font-bold">
                  <th className="pb-2 font-bold">الموقع</th>
                  <th className="pb-2 font-bold text-center">حالة الاتصال</th>
                  <th className="pb-2 font-bold text-center">استخدام الإنترنت</th>
                  <th className="pb-2 font-bold text-center">الأجهزة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {topSites.map((site) => {
                  const isConnected = site.status === 'connected';
                  return (
                    <tr
                      key={site.id}
                      onClick={() => onToggleSiteConnection(site.id)}
                      title="انقر لتغيير حالة الاتصال بالموقع"
                      className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                    >
                      {/* الموقع */}
                      <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">
                        {site.name}
                      </td>

                      {/* حالة الاتصال */}
                      <td className="py-2.5 text-center whitespace-nowrap">
                        {isConnected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            متصل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            غير متصل
                          </span>
                        )}
                      </td>

                      {/* استخدام الإنترنت */}
                      <td className="py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-700 tabular-nums w-7">
                            {site.internetUsage}%
                          </span>
                          <div className="w-14 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                site.internetUsage > 80
                                  ? 'bg-red-500'
                                  : site.internetUsage > 0
                                  ? 'bg-blue-500'
                                  : 'bg-slate-300'
                              }`}
                              style={{ width: `${site.internetUsage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* الأجهزة */}
                      <td className="py-2.5 text-center font-bold text-slate-700 tabular-nums">
                        {site.devicesCount > 0 ? site.devicesCount : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ---------------- 2. CARD: المهام والإجراءات (col-span-2 or 3) ---------------- */}
      <div className="xl:col-span-2 bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm">
                المهام والإجراءات
              </h2>
            </div>
            <button
              onClick={onOpenAllTasks}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              عرض الكل
            </button>
          </div>

          {/* 4 Task Items */}
          <div className="space-y-3 font-semibold text-xs">
            {/* 1. موافقات معلقة على المشاريع */}
            <div
              onClick={onOpenAllTasks}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                موافقات معلقة على المشاريع
              </span>
              <span className="w-7 h-7 rounded-full bg-red-100 text-red-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums">
                {tasksCounters.pendingApprovals}
              </span>
            </div>

            {/* 2. طلبات دعم فني مفتوحة */}
            <div
              onClick={onOpenAllTasks}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                طلبات دعم فني مفتوحة
              </span>
              <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums">
                {tasksCounters.openTickets}
              </span>
            </div>

            {/* 3. مهام صيانة مجدولة */}
            <div
              onClick={onOpenAllTasks}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                مهام صيانة مجدولة
              </span>
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums">
                {tasksCounters.maintenanceTasks}
              </span>
            </div>

            {/* 4. تحديثات الأنظمة */}
            <div
              onClick={onOpenAllTasks}
              className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                تحديثات الأنظمة
              </span>
              <span className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-black text-xs flex items-center justify-center shrink-0 tabular-nums">
                {tasksCounters.systemUpdates}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- 3. CARD: إنشاء مشروع جديد (Hero CTA) (col-span-2) ---------------- */}
      <div
        onClick={onOpenNewProject}
        className="xl:col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-400 via-blue-500 to-blue-600 p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center select-none"
      >
        {/* Subtle Crane Blueprint Outline Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <svg viewBox="0 0 160 160" className="w-full h-full text-white" fill="none">
            <line x1="80" y1="160" x2="80" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="80" y1="20" x2="150" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="80" y1="20" x2="30" y2="40" stroke="currentColor" strokeWidth="2" />
            <line x1="80" y1="50" x2="130" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="80" y1="80" x2="110" y2="20" stroke="currentColor" strokeWidth="1" />
            <line x1="140" y1="20" x2="140" y2="70" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
            <rect x="135" y="70" width="10" height="10" fill="currentColor" />
          </svg>
        </div>

        {/* Big White Circular + Button */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-90 transition-all duration-300 mb-3">
          <Plus className="w-8 h-8 stroke-[3]" />
        </div>

        {/* Title */}
        <h3 className="relative z-10 text-xl font-black tracking-tight text-white drop-shadow-sm mb-1">
          إنشاء
        </h3>
        <p className="relative z-10 text-base font-extrabold text-sky-100">
          مشروع جديد
        </p>

        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-blue-700/60 to-transparent pointer-events-none" />
      </div>

      {/* ---------------- 4. CARD: أهم المشاريع الجارية (col-span-4) ---------------- */}
      <div className="xl:col-span-4 bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Building className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm">
                أهم المشاريع الجارية
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {onOpenGantt && (
                <button
                  onClick={onOpenGantt}
                  className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-blue-600" />
                  <span>مخطط جانت</span>
                </button>
              )}
              <button
                onClick={onOpenAllProjects}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                عرض الكل
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 text-[11px] font-bold">
                  <th className="pb-2 font-bold">المشروع</th>
                  <th className="pb-2 font-bold text-center">نسبة التنفيذ</th>
                  <th className="pb-2 font-bold text-center">التسليم الإبتدائي</th>
                  <th className="pb-2 font-bold text-center">التسليم النهائي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {topProjects.map((proj) => (
                  <tr
                    key={proj.id}
                    onClick={onOpenAllProjects}
                    className="hover:bg-sky-50/50 transition-colors cursor-pointer group"
                  >
                    {/* المشروع */}
                    <td className="py-2.5 font-bold text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        {proj.budgetBurnRatePct !== undefined && proj.budgetBurnRatePct >= 90 && (
                          <span title={`تنبيه مالي آلي: استهلاك ${proj.budgetBurnRatePct}% من الميزانية المحددة`}>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline shrink-0 animate-pulse" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* نسبة التنفيذ */}
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 tabular-nums w-6">
                          {proj.executionRate}%
                        </span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${proj.executionRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* التسليم الإبتدائي */}
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-700 tabular-nums w-6">
                          {proj.initialHandoverRate}%
                        </span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${proj.initialHandoverRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* التسليم النهائي */}
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 tabular-nums w-6">
                          {proj.finalHandoverRate}%
                        </span>
                        <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-slate-300 h-full rounded-full"
                            style={{ width: `${proj.finalHandoverRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
