import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Search,
  Trash2,
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
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  onOpenNewProject,
  onDeleteProject,
  onUpdateProjectProgress,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'in_progress' | 'delayed' | 'at_risk'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = projects.filter((p) => {
    const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">كافة المشاريع الإنشائية والتقنية ({projects.length})</h3>
              <p className="text-xs text-slate-400">متابعة نسب التنفيذ والتسليم المبدئي والنهائي للمشاريع</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNewProject();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>مشروع جديد</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Filters and Search */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-white rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({projects.length})
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeFilter === 'in_progress' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              قيد التنفيذ ({projects.filter((p) => p.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeFilter === 'completed' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مكتملة ({projects.filter((p) => p.status === 'completed').length})
            </button>
            <button
              onClick={() => setActiveFilter('delayed')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeFilter === 'delayed' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مؤجلة ({projects.filter((p) => p.status === 'delayed').length})
            </button>
            <button
              onClick={() => setActiveFilter('at_risk')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                activeFilter === 'at_risk' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              معرضة للمخاطر ({projects.filter((p) => p.status === 'at_risk').length})
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
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filtered.map((proj) => (
            <div key={proj.id} className="py-3.5 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
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
                    <h4 className="text-sm font-bold text-slate-800">{proj.name}</h4>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {proj.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                    <span>الموقع: {proj.location}</span>
                    <span>·</span>
                    <span>المدير: {proj.manager}</span>
                    <span>·</span>
                    <span className="tabular-nums font-bold text-slate-700">
                      {proj.budgetEGP.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center w-20">
                    <span className="text-[10px] text-slate-400 block">التنفيذ</span>
                    <div className="flex items-center gap-1 justify-center">
                      <span className="text-xs font-extrabold text-emerald-600 tabular-nums">
                        {proj.executionRate}%
                      </span>
                    </div>
                    <div className="w-16 bg-slate-100 h-1 rounded-full mx-auto mt-0.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${proj.executionRate}%` }} />
                    </div>
                  </div>

                  <div className="text-center w-20">
                    <span className="text-[10px] text-slate-400 block">التسليم الابتدائي</span>
                    <span className="text-xs font-extrabold text-blue-600 tabular-nums">
                      {proj.initialHandoverRate}%
                    </span>
                    <div className="w-16 bg-slate-100 h-1 rounded-full mx-auto mt-0.5 overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${proj.initialHandoverRate}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newRate = Math.min(100, proj.executionRate + 5);
                        onUpdateProjectProgress(proj.id, newRate);
                      }}
                      title="زيادة نسبة الإنجاز +5%"
                      className="px-2 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      +5%
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="حذف المشروع"
                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد مشاريع مطابقة لبحثك
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
