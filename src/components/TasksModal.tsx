import React, { useState } from 'react';
import { CheckSquare, Check, Clock, Filter, X } from 'lucide-react';
import { TaskItem } from '../types/dashboard';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  onToggleTask: (id: string) => Promise<void>;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'approval' | 'support' | 'maintenance' | 'update'>('all');

  if (!isOpen) return null;

  const filtered = tasks.filter((t) => filter === 'all' || t.category === filter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">المهام والإجراءات المعلقة ({tasks.length})</h3>
              <p className="text-xs text-slate-400">موافقات المشاريع، تذاكر الدعم الفني، والصيانة الوقائية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('approval')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filter === 'approval' ? 'bg-red-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            موافقات المشاريع
          </button>
          <button
            onClick={() => setFilter('support')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filter === 'support' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تذاكر الدعم الفني
          </button>
          <button
            onClick={() => setFilter('maintenance')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filter === 'maintenance' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            مهام الصيانة
          </button>
          <button
            onClick={() => setFilter('update')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
              filter === 'update' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تحديثات الأنظمة
          </button>
        </div>

        {/* Task Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                task.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-blue-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-blue-500 text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>

                <div>
                  <h4
                    className={`text-xs font-bold ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-800'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{task.projectOrSite}</span>
                    <span>·</span>
                    <span>المسؤول: {task.assignedTo}</span>
                    <span>·</span>
                    <span>الموعد: {task.dueDate}</span>
                  </div>
                </div>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد مهام في هذا التصنيف حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
