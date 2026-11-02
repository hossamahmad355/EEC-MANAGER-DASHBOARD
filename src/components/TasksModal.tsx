import React, { useState } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  ListTodo,
  PieChart as PieChartIcon,
  RefreshCw,
  User,
  X,
} from 'lucide-react';
import { TaskItem } from '../types/dashboard';

interface TasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  onToggleTask: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, status: 'in_progress' | 'completed' | 'delayed') => Promise<void>;
}

export const TasksModal: React.FC<TasksModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onToggleTask,
  onUpdateStatus,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'approval' | 'support' | 'maintenance' | 'update'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed' | 'delayed'>('all');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  // Helper to determine status if not explicitly set
  const getTaskStatus = (t: TaskItem): 'in_progress' | 'completed' | 'delayed' => {
    if (t.status) return t.status;
    if (t.completed) return 'completed';
    const isPastDue = new Date(t.dueDate).getTime() < new Date('2026-11-02').getTime();
    return isPastDue ? 'delayed' : 'in_progress';
  };

  // Counts by status
  const inProgressCount = tasks.filter((t) => getTaskStatus(t) === 'in_progress').length;
  const completedCount = tasks.filter((t) => getTaskStatus(t) === 'completed').length;
  const delayedCount = tasks.filter((t) => getTaskStatus(t) === 'delayed').length;
  const totalTasks = tasks.length;

  const inProgressPct = totalTasks > 0 ? Math.round((inProgressCount / totalTasks) * 100) : 0;
  const completedPct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const delayedPct = totalTasks > 0 ? Math.round((delayedCount / totalTasks) * 100) : 0;

  // Recharts Pie Data
  const pieData = [
    {
      name: 'قيد التنفيذ',
      statusKey: 'in_progress' as const,
      value: inProgressCount,
      color: '#3b82f6', // Tailwind blue-500
      secondaryColor: '#60a5fa',
      percentage: inProgressPct,
    },
    {
      name: 'مكتملة',
      statusKey: 'completed' as const,
      value: completedCount,
      color: '#10b981', // Tailwind emerald-500
      secondaryColor: '#34d399',
      percentage: completedPct,
    },
    {
      name: 'مؤجلة',
      statusKey: 'delayed' as const,
      value: delayedCount,
      color: '#f59e0b', // Tailwind amber-500
      secondaryColor: '#fbbf24',
      percentage: delayedPct,
    },
  ];

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const taskStatus = getTaskStatus(t);
    const matchStatus = statusFilter === 'all' || taskStatus === statusFilter;
    return matchCategory && matchStatus;
  });

  // Custom Tooltip for Recharts Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-['Cairo',sans-serif] text-right min-w-[150px] dir-rtl">
          <div className="flex items-center justify-between gap-3 border-b border-slate-700/80 pb-1.5 mb-1.5">
            <span className="font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {data.name}
            </span>
            <span className="text-[11px] font-mono font-bold text-sky-300">
              {data.percentage}%
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300 text-[11px]">
            <span>العدد الإجمالي:</span>
            <span className="font-bold text-white">{data.value} مهام</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 md:p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">المهام وسير العمل التنفيذي</h3>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2.5 py-0.5 rounded-full border border-blue-700/50 font-bold">
                  {totalTasks} مهمة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                متابعة موافقات المشاريع، تذاكر الدعم الفني، والصيانة مع توزيع الحالة الحية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Recharts Pie Chart & Workflow Distribution Card */}
        <div className="bg-gradient-to-br from-slate-50 via-sky-50/40 to-blue-50/30 p-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-bold text-slate-800">
                توزيع المهام حسب الحالة (Pie Chart - Recharts)
              </h4>
              <span className="text-[10px] text-slate-400">· انقر على أي فئة للفلترة المباشرة</span>
            </div>

            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs transition-colors"
              >
                <span>إلغاء فلتر الحالة</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Recharts Pie Chart Container */}
            <div className="md:col-span-5 flex items-center justify-center relative bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs">
              <div className="w-[180px] h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={68}
                      paddingAngle={4}
                      onClick={(entry: any) => {
                        const targetKey = entry.statusKey;
                        setStatusFilter((prev) => (prev === targetKey ? 'all' : targetKey));
                      }}
                      cursor="pointer"
                    >
                      {pieData.map((entry, index) => {
                        const isSelected = statusFilter === entry.statusKey;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            stroke={isSelected ? '#1e293b' : '#ffffff'}
                            strokeWidth={isSelected ? 3 : 2}
                            opacity={statusFilter === 'all' || isSelected ? 1 : 0.4}
                          />
                        );
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-base font-extrabold text-slate-900 leading-none">
                    {completedPct}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                    نسبة الإنجاز
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pr-2 border-r border-slate-100 flex flex-col gap-1">
                <span className="font-bold text-slate-700">المجموع: {totalTasks}</span>
                <span className="text-[10px] text-slate-400">مهام مجدولة</span>
              </div>
            </div>

            {/* Interactive Status Summary Badges (3 Interactive Cards) */}
            <div className="md:col-span-7 grid grid-cols-3 gap-2">
              {/* 1. قيد التنفيذ */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'in_progress' ? 'all' : 'in_progress'))}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  statusFilter === 'in_progress'
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-400/40 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono">
                    {inProgressPct}%
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">قيد التنفيذ</h5>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-blue-600 tabular-nums">
                      {inProgressCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">مهام</span>
                  </div>
                </div>
              </button>

              {/* 2. مكتملة */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'completed' ? 'all' : 'completed'))}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/40 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    {completedPct}%
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">مكتملة</h5>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-emerald-600 tabular-nums">
                      {completedCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">مهام</span>
                  </div>
                </div>
              </button>

              {/* 3. مؤجلة */}
              <button
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === 'delayed' ? 'all' : 'delayed'))}
                className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  statusFilter === 'delayed'
                    ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                    {delayedPct}%
                  </span>
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">مؤجلة / متأخرة</h5>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-lg font-black text-amber-600 tabular-nums">
                      {delayedCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">مهام</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 ml-1">التصنيف:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              الكل ({tasks.length})
            </button>
            <button
              onClick={() => setCategoryFilter('approval')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                categoryFilter === 'approval'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              موافقات المشاريع
            </button>
            <button
              onClick={() => setCategoryFilter('support')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                categoryFilter === 'support'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              تذاكر الدعم الفني
            </button>
            <button
              onClick={() => setCategoryFilter('maintenance')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                categoryFilter === 'maintenance'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              مهام الصيانة
            </button>
            <button
              onClick={() => setCategoryFilter('update')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                categoryFilter === 'update'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
              }`}
            >
              تحديثات الأنظمة
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-bold shrink-0">
            المعروض: <span className="text-slate-800">{filteredTasks.length}</span>
          </div>
        </div>

        {/* Task Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTasks.map((task) => {
            const status = getTaskStatus(task);
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  status === 'completed'
                    ? 'bg-emerald-50/40 border-emerald-200/80'
                    : status === 'delayed'
                    ? 'bg-amber-50/40 border-amber-200/80 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  {/* Toggle button */}
                  <button
                    type="button"
                    onClick={() => onToggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all mt-0.5 sm:mt-0 shrink-0 ${
                      status === 'completed'
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                        : 'border-slate-300 hover:border-blue-500 text-transparent hover:text-slate-400 bg-white'
                    }`}
                    title={status === 'completed' ? 'إلغاء الإكمال' : 'تحديد كمكتملة'}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs font-bold ${
                          status === 'completed'
                            ? 'line-through text-slate-400'
                            : 'text-slate-800'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : status === 'delayed'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {status === 'delayed' && <AlertCircle className="w-3 h-3" />}
                        {status === 'in_progress' && <Clock className="w-3 h-3" />}
                        <span>
                          {status === 'completed'
                            ? 'مكتملة'
                            : status === 'delayed'
                            ? 'مؤجلة'
                            : 'قيد التنفيذ'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 flex-wrap">
                      <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {task.projectOrSite}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <User className="w-3 h-3 text-slate-400" />
                        {task.assignedTo}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        الاستحقاق: <span className="font-mono">{task.dueDate}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Status Dropdown/Selector if onUpdateStatus provided */}
                  {onUpdateStatus && (
                    <select
                      value={status}
                      onChange={(e) =>
                        onUpdateStatus(task.id, e.target.value as 'in_progress' | 'completed' | 'delayed')
                      }
                      className="text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتملة</option>
                      <option value="delayed">مؤجلة</option>
                    </select>
                  )}

                  {/* Priority Badge */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg whitespace-nowrap border ${
                      task.priority === 'high'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {task.priority === 'high' ? 'عاجل' : task.priority === 'medium' ? 'متوسط' : 'عادي'}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              لا توجد مهام تطابق الفلاتر المحددة حالياً
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              قيد التنفيذ: <b className="text-slate-800">{inProgressCount}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              مكتملة: <b className="text-slate-800">{completedCount}</b>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              مؤجلة: <b className="text-slate-800">{delayedCount}</b>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
