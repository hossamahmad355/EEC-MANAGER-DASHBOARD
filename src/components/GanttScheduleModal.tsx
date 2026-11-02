import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Filter,
  Flag,
  HelpCircle,
  Layers,
  Milestone,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { GanttScheduleData, Project, ScheduleConflict } from '../types/dashboard';

interface GanttScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleData: GanttScheduleData | null;
  onUpdateSchedule: (id: string, startDate?: string, endDate?: string) => Promise<void>;
  onRefresh: () => void;
}

export const GanttScheduleModal: React.FC<GanttScheduleModalProps> = ({
  isOpen,
  onClose,
  scheduleData,
  onUpdateSchedule,
  onRefresh,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'conflicts_only' | 'in_progress' | 'delayed'>('all');
  const [scale, setScale] = useState<'quarterly' | 'monthly'>('quarterly');
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newEndDate, setNewEndDate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Projects involved in conflicts (declared unconditionally before early return)
  const conflictingProjectIds = useMemo(() => {
    const ids = new Set<string>();
    if (scheduleData?.conflicts) {
      scheduleData.conflicts.forEach((c) => {
        c.projectIds.forEach((id) => ids.add(id));
      });
    }
    return ids;
  }, [scheduleData?.conflicts]);

  if (!isOpen || !scheduleData) return null;

  // Timeline boundaries (2025-01-01 to 2027-12-31 = 36 months)
  const timelineStart = new Date(scheduleData.timelineStart || '2025-01-01').getTime();
  const timelineEnd = new Date(scheduleData.timelineEnd || '2027-12-31').getTime();
  const totalDuration = timelineEnd - timelineStart;
  const currentDateMs = new Date(scheduleData.currentDate || '2026-11-02').getTime();
  const currentPosPct = Math.max(0, Math.min(100, ((currentDateMs - timelineStart) / totalDuration) * 100));

  // Generate Quarters / Months Header
  const quarters = [
    { label: 'Q1 2025', startPct: 0, widthPct: 8.33 },
    { label: 'Q2 2025', startPct: 8.33, widthPct: 8.33 },
    { label: 'Q3 2025', startPct: 16.66, widthPct: 8.33 },
    { label: 'Q4 2025', startPct: 25.0, widthPct: 8.33 },
    { label: 'Q1 2026', startPct: 33.33, widthPct: 8.33 },
    { label: 'Q2 2026', startPct: 41.66, widthPct: 8.33 },
    { label: 'Q3 2026', startPct: 50.0, widthPct: 8.33 },
    { label: 'Q4 2026', startPct: 58.33, widthPct: 8.33, isCurrentQuarter: true },
    { label: 'Q1 2027', startPct: 66.66, widthPct: 8.33 },
    { label: 'Q2 2027', startPct: 75.0, widthPct: 8.33 },
    { label: 'Q3 2027', startPct: 83.33, widthPct: 8.33 },
    { label: 'Q4 2027', startPct: 91.66, widthPct: 8.33 },
  ];

  // Filtered Projects
  const filteredProjects = scheduleData.projects.filter((p) => {
    if (activeFilter === 'conflicts_only') return conflictingProjectIds.has(p.id);
    if (activeFilter === 'in_progress') return p.status === 'in_progress';
    if (activeFilter === 'delayed') return p.status === 'delayed' || p.status === 'at_risk';
    return true;
  });

  // Handle Quick Reschedule / Resolve Conflict
  const handleResolveConflict = async (conflict: ScheduleConflict) => {
    if (!conflict.projectIds || conflict.projectIds.length < 2) return;
    const targetProjectId = conflict.projectIds[1];
    const targetProject = scheduleData.projects.find((p) => p.id === targetProjectId);
    if (!targetProject) return;

    setIsUpdating(true);
    try {
      // Shift endDate by +30 days
      const currentEnd = new Date(targetProject.endDate).getTime();
      const newEnd = new Date(currentEnd + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      await onUpdateSchedule(targetProjectId, undefined, newEnd);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDate = async () => {
    if (!editingProject || !newEndDate) return;
    setIsUpdating(true);
    try {
      await onUpdateSchedule(editingProject.id, undefined, newEndDate);
      setEditingProject(null);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[92vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">مخطط جانت للجدولة الزمنية وكشف التعارضات</h3>
                {scheduleData.conflicts.length > 0 && (
                  <span className="bg-red-500 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{scheduleData.conflicts.length} تعارضات رصدت</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                متابعة مواعيد التسليم المبدئي والنهائي للمشاريع وتنبيهات تداخل لجان الفحص
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              title="تحديث البيانات"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conflict Detection Banner */}
        {scheduleData.conflicts.length > 0 && (
          <div className="bg-red-50 border-b border-red-200 p-3.5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-red-900">
                    تنبيه تعارض مواعيد التسليم (Handover Conflict Alerts):
                  </h4>
                  <p className="text-[11px] text-red-800 font-semibold mt-0.5">
                    يوجد تقارب حرج في مواعيد التسليم النهائي بين مشاريع متزامنة مما يهدد جاهزية لجان الاستلام الهندسي
                  </p>
                </div>
              </div>

              {/* Quick Conflict Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {scheduleData.conflicts.map((conf) => (
                  <div
                    key={conf.id}
                    onClick={() => setSelectedConflictId(selectedConflictId === conf.id ? null : conf.id)}
                    className={`cursor-pointer px-3 py-1 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      selectedConflictId === conf.id
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white text-red-800 border-red-300 hover:bg-red-100'
                    }`}
                  >
                    <span>{conf.projectNames.join(' ↔ ')}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolveConflict(conf);
                      }}
                      disabled={isUpdating}
                      title="ترحيل الموعد وحل التعارض تلقائياً"
                      className="ml-1 bg-red-800/20 hover:bg-red-800/40 text-current px-1.5 py-0.5 rounded text-[10px] flex items-center gap-0.5"
                    >
                      <Zap className="w-3 h-3 inline text-amber-500" />
                      <span>حل (+30 يوم)</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Conflict Details Box */}
            {selectedConflictId && (
              <div className="mt-2.5 p-3 rounded-xl bg-white border border-red-200 text-xs shadow-xs animate-in slide-in-from-top-1">
                {(() => {
                  const conf = scheduleData.conflicts.find((c) => c.id === selectedConflictId);
                  if (!conf) return null;
                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-red-700">{conf.title}: </span>
                        <span className="text-slate-700 font-medium">{conf.description}</span>
                        <p className="text-[11px] text-emerald-700 font-bold mt-1">
                          💡 المقترح: {conf.suggestedAction}
                        </p>
                      </div>
                      <button
                        onClick={() => handleResolveConflict(conf)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                      >
                        {isUpdating ? 'جاري المعالجة...' : 'تطبيق الترحيل وحل التعارض'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة المشاريع ({scheduleData.projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('conflicts_only')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === 'conflicts_only' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              المشاريع المتعارضة فقط ({conflictingProjectIds.size})
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === 'in_progress' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قيد التنفيذ
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                activeFilter === 'delayed' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مؤجلة / حرجة
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span>نسبة التنفيذ الفعلية</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Milestone className="w-3.5 h-3.5 text-blue-600" />
              <span>التسليم الإبتدائي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-red-500" />
              <span>موعد التسليم النهائي</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>اليوم (نوفمبر 2026)</span>
            </div>
          </div>
        </div>

        {/* Gantt Matrix Chart Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50/40">
          <div className="min-w-[900px]">
            {/* Timeline Column Headers */}
            <div className="flex items-center border-b border-slate-200 pb-2 mb-3 text-xs font-bold text-slate-600">
              {/* Left Fixed Label column */}
              <div className="w-72 shrink-0 pr-2">
                <span>المشروع والمسؤول</span>
              </div>

              {/* Timeline Header Track */}
              <div className="flex-1 relative h-6 flex">
                {quarters.map((q, idx) => (
                  <div
                    key={idx}
                    className={`text-center text-[11px] font-bold border-r border-slate-200/80 px-1 ${
                      q.isCurrentQuarter ? 'text-blue-700 bg-blue-50/60 rounded' : 'text-slate-500'
                    }`}
                    style={{ width: `${q.widthPct}%` }}
                  >
                    {q.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Project Rows */}
            <div className="space-y-3 relative">
              {/* Current Date Vertical Red/Blue Line */}
              <div
                className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
                style={{ right: `${currentPosPct}%` }}
              >
                <div className="w-0.5 h-full bg-blue-600/80 border-r border-dashed border-blue-400" />
                <span className="absolute -top-3 bg-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  اليوم (نوفمبر 2026)
                </span>
              </div>

              {filteredProjects.map((p) => {
                const pStart = new Date(p.startDate).getTime();
                const pEnd = new Date(p.endDate).getTime();
                const leftPct = Math.max(0, Math.min(100, ((pStart - timelineStart) / totalDuration) * 100));
                const rightPct = Math.max(0, Math.min(100, ((pEnd - timelineStart) / totalDuration) * 100));
                const widthPct = Math.max(3, rightPct - leftPct);
                const isConflicted = conflictingProjectIds.has(p.id);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center p-2 rounded-xl transition-all border ${
                      isConflicted
                        ? 'bg-red-50/40 border-red-300 shadow-xs ring-1 ring-red-400/30'
                        : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                    }`}
                  >
                    {/* Left Meta Info */}
                    <div className="w-72 shrink-0 pr-2 pl-3 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {isConflicted && (
                            <span title="يوجد تعارض في موعد التسليم">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            </span>
                          )}
                          <h4 className="font-bold text-xs text-slate-900 truncate max-w-[170px]" title={p.name}>
                            {p.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {p.manager} · التسليم: <span className="font-mono font-bold text-slate-700">{p.endDate}</span>
                        </p>
                      </div>

                      {/* Edit Date Trigger */}
                      <button
                        onClick={() => {
                          setEditingProject(p);
                          setNewEndDate(p.endDate);
                        }}
                        title="تعديل الجدول الزمني وموعد التسليم"
                        className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Timeline Canvas Row */}
                    <div className="flex-1 relative h-9 flex items-center">
                      {/* Background Quarter Guide Lines */}
                      <div className="absolute inset-0 flex pointer-events-none">
                        {quarters.map((_, i) => (
                          <div key={i} className="flex-1 border-r border-slate-100" />
                        ))}
                      </div>

                      {/* The Gantt Bar */}
                      <div
                        className={`absolute h-7 rounded-lg transition-all flex items-center overflow-hidden border shadow-xs group ${
                          isConflicted
                            ? 'border-red-400 ring-2 ring-red-500/30'
                            : 'border-slate-300'
                        } ${
                          p.status === 'completed'
                            ? 'bg-emerald-100'
                            : p.status === 'in_progress'
                            ? 'bg-sky-100'
                            : p.status === 'delayed'
                            ? 'bg-amber-100'
                            : 'bg-red-100'
                        }`}
                        style={{
                          right: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      >
                        {/* Progress Fill inside bar */}
                        <div
                          className="h-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${p.executionRate}%` }}
                        />

                        {/* Text & Milestones inside bar */}
                        <div className="absolute inset-0 flex items-center justify-between px-2 text-[10px] font-bold select-none pointer-events-none">
                          <span className="text-slate-800 drop-shadow-xs tabular-nums">
                            {p.executionRate}%
                          </span>

                          <div className="flex items-center gap-1">
                            {p.initialHandoverRate > 0 && (
                              <span className="text-blue-700" title={`تسليم ابتدائي ${p.initialHandoverRate}%`}>
                                <Milestone className="w-3 h-3 inline" />
                              </span>
                            )}
                            <span title={`موعد التسليم: ${p.endDate}`}>
                              <Flag className="w-3 h-3 text-red-600" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reschedule Modal / Popover */}
        {editingProject && (
          <div className="p-4 bg-slate-900 text-white border-t border-slate-700 flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-xs font-bold">
                  تعديل موعد التسليم النهائي لمشروع: <span className="text-sky-300">{editingProject.name}</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  الموعد الحالي: {editingProject.endDate} (تعديل التاريخ سيعيد فحص التعارضات آلياً)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />

              {/* Quick Shift +30 Days Button */}
              <button
                type="button"
                onClick={() => {
                  const curr = new Date(newEndDate || editingProject.endDate).getTime();
                  setNewEndDate(new Date(curr + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-600"
              >
                +30 يوم
              </button>

              <button
                onClick={handleSaveDate}
                disabled={isUpdating}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'جاري الحفظ...' : 'حفظ وإعادة الفحص'}
              </button>

              <button
                onClick={() => setEditingProject(null)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
