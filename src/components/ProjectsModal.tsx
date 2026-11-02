import React, { useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Files,
  Filter,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { Project } from '../types/dashboard';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onOpenNewProject: () => void;
  onDeleteProject: (id: string) => Promise<void>;
  onUpdateProjectProgress: (id: string, executionRate: number) => Promise<void>;
  onUpdateProjectExpenses?: (id: string, expensesEGP: number) => Promise<void>;
  onOpenProjectDocuments?: (projectId: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onOpenNewProject,
  onDeleteProject,
  onUpdateProjectProgress,
  onUpdateProjectExpenses,
  onOpenProjectDocuments,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'over_budget' | 'completed' | 'in_progress' | 'delayed' | 'at_risk'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingExpenseProject, setEditingExpenseProject] = useState<Project | null>(null);
  const [customExpenseInput, setCustomExpenseInput] = useState<string>('');
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  if (!isOpen) return null;

  // Calculate helper for budget burn rate
  const getProjectExpenses = (p: Project) => {
    return p.actualExpensesEGP !== undefined
      ? p.actualExpensesEGP
      : Math.round(p.budgetEGP * (p.executionRate / 100));
  };

  const getBurnRate = (p: Project) => {
    const expenses = getProjectExpenses(p);
    return (expenses / p.budgetEGP) * 100;
  };

  const overBudgetCount = projects.filter((p) => getBurnRate(p) >= 90).length;

  const filtered = projects.filter((p) => {
    const burnRate = getBurnRate(p);
    let matchesFilter = true;

    if (activeFilter === 'over_budget') {
      matchesFilter = burnRate >= 90;
    } else if (activeFilter !== 'all') {
      matchesFilter = p.status === activeFilter;
    }

    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleOpenExpenseModal = (p: Project) => {
    setEditingExpenseProject(p);
    setCustomExpenseInput(getProjectExpenses(p).toString());
  };

  const handleSaveExpenses = async (amount: number) => {
    if (!editingExpenseProject || !onUpdateProjectExpenses) return;
    setIsSavingExpense(true);
    try {
      await onUpdateProjectExpenses(editingExpenseProject.id, amount);
      setEditingExpenseProject(null);
    } finally {
      setIsSavingExpense(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">إدارة ومتابعة كافة المشاريع ({projects.length})</h3>
                {overBudgetCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{overBudgetCount} مشاريع تجاوزت 90% من الميزانية</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                متابعة نسب التنفيذ، الاستهلاك المالي، والتنبيه الآلي لتجاوز الميزانيات المعتمدة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>مشروع جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Filters and Search */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto p-1 bg-white rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('over_budget')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeFilter === 'over_budget' ? 'bg-red-600 text-white shadow-2xs' : 'text-red-700 bg-red-50 hover:bg-red-100'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>تحذير ميزانية &gt;90% ({overBudgetCount})</span>
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'in_progress' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قيد التنفيذ ({projects.filter((p) => p.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مكتملة ({projects.filter((p) => p.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'delayed' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مؤجلة ({projects.filter((p) => p.status === 'delayed').length})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="بحث بالاسم، المدير، أو الموقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white text-slate-800"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.map((proj) => {
            const expenses = getProjectExpenses(proj);
            const burnRate = getBurnRate(proj);
            const isOverBudget = burnRate >= 90;

            return (
              <div
                key={proj.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isOverBudget
                    ? 'bg-red-50/40 border-red-300 ring-1 ring-red-200 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Meta Info */}
                  <div className="flex-1 min-w-[260px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          proj.status === 'completed'
                            ? 'bg-emerald-500'
                            : proj.status === 'in_progress'
                            ? 'bg-blue-500'
                            : proj.status === 'delayed'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {proj.category}
                      </span>

                      {/* 90% Budget Warning Badge */}
                      {isOverBudget && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>تنبيه آلي: استهلاك {burnRate.toFixed(1)}% من الميزانية</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 flex-wrap">
                      <span>الموقع: <b className="text-slate-700">{proj.location}</b></span>
                      <span>·</span>
                      <span>المدير: <b className="text-slate-700">{proj.manager}</b></span>
                      <span>·</span>
                      <span>التسليم: <span className="font-mono">{proj.endDate}</span></span>
                    </div>

                    {/* Financial Burn Rate Bar */}
                    <div className="mt-2.5 bg-slate-100/80 p-2 rounded-lg border border-slate-200/60 max-w-md">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-600 flex items-center gap-1 font-semibold">
                          <Coins className="w-3 h-3 text-amber-500" />
                          <span>المصروفات الفعلية:</span>
                          <b className={`font-bold ${isOverBudget ? 'text-red-700' : 'text-slate-800'}`}>
                            {(expenses / 1000000).toFixed(1)}M
                          </b>
                          <span>من أصل</span>
                          <b className="text-slate-800">{(proj.budgetEGP / 1000000).toFixed(1)}M ج.م</b>
                        </span>

                        <span className={`font-mono font-extrabold text-xs ${isOverBudget ? 'text-red-600' : 'text-slate-700'}`}>
                          {burnRate.toFixed(1)}%
                        </span>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isOverBudget
                              ? 'bg-gradient-to-r from-amber-500 to-red-600'
                              : burnRate > 75
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, burnRate)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress & Quick Actions */}
                  <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                    {/* Execution Rate */}
                    <div className="text-center w-16 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">التنفيذ</span>
                      <span className="text-xs font-black text-emerald-600 tabular-nums">
                        {proj.executionRate}%
                      </span>
                      <div className="w-12 bg-slate-200 h-1 rounded-full mx-auto mt-0.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${proj.executionRate}%` }} />
                      </div>
                    </div>

                    {/* Initial Handover */}
                    <div className="text-center w-16 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-bold">ابتدائي</span>
                      <span className="text-xs font-black text-blue-600 tabular-nums">
                        {proj.initialHandoverRate}%
                      </span>
                      <div className="w-12 bg-slate-200 h-1 rounded-full mx-auto mt-0.5 overflow-hidden">
                        <div className="bg-blue-500 h-full" style={{ width: `${proj.initialHandoverRate}%` }} />
                      </div>
                    </div>

                    {/* Update Expenses Button */}
                    <button
                      onClick={() => handleOpenExpenseModal(proj)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-2xs ${
                        isOverBudget
                          ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                          : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                      title="تسجيل وتعديل المصروفات الفعلية لهذا المشروع"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>تعديل المصروفات</span>
                    </button>

                    {/* Project Documents DMS Button */}
                    {onOpenProjectDocuments && (
                      <button
                        onClick={() => onOpenProjectDocuments(proj.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-2xs"
                        title="عرض عقود ومخططات وشهادات ضمان هذا المشروع"
                      >
                        <Files className="w-3.5 h-3.5 text-indigo-600" />
                        <span>المستندات</span>
                      </button>
                    )}

                    {/* Progress +5% */}
                    <button
                      onClick={() => {
                        const newRate = Math.min(100, proj.executionRate + 5);
                        onUpdateProjectProgress(proj.id, newRate);
                      }}
                      title="زيادة نسبة الإنجاز +5%"
                      className="px-2 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      +5%
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="حذف المشروع"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
              لا توجد مشاريع مطابقة لبحثك في هذه الفئة
            </div>
          )}
        </div>
      </div>

      {/* Inline Modal: Edit Project Expenses to Test or Record Budget */}
      {editingExpenseProject && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-sky-200 text-right font-['Cairo',sans-serif]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Coins className="w-4 h-4 text-blue-600" />
                <span>تعديل المصروفات الفعلية للمشروع</span>
              </div>
              <button
                onClick={() => setEditingExpenseProject(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-xs text-slate-800">{editingExpenseProject.name}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                الميزانية المعتمدة: <b className="text-blue-600">{(editingExpenseProject.budgetEGP / 1000000).toFixed(1)} مليون ج.م</b>
              </p>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1">
              المصروفات الفعلية الإجمالية (بالجنيه المصري):
            </label>
            <input
              type="number"
              value={customExpenseInput}
              onChange={(e) => setCustomExpenseInput(e.target.value)}
              className="w-full p-2.5 text-xs font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              placeholder="مثال: 175000000"
            />

            {/* Quick Presets for Demo & Testing */}
            <div className="space-y-1.5 mb-4">
              <span className="text-[10px] font-bold text-slate-400 block">اختصارات سريعة للمعاينة:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const ninetyTwoPct = Math.round(editingExpenseProject.budgetEGP * 0.92);
                    setCustomExpenseInput(ninetyTwoPct.toString());
                  }}
                  className="px-2 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-[11px] font-bold flex items-center justify-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  <span>تطبيق 92% (لتشغيل التنبيه الآلي)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const seventyPct = Math.round(editingExpenseProject.budgetEGP * 0.70);
                    setCustomExpenseInput(seventyPct.toString());
                  }}
                  className="px-2 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold text-center"
                >
                  تطبيق 70% (استهلاك آمن)
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingExpenseProject(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isSavingExpense || !customExpenseInput}
                onClick={() => handleSaveExpenses(Number(customExpenseInput))}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs disabled:opacity-50"
              >
                {isSavingExpense ? 'جاري الحفظ...' : 'حفظ وتحديث الميزانية'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
