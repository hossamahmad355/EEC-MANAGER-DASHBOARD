import React, { useState } from 'react';
import { Building, DollarSign, MapPin, User, X } from 'lucide-react';
import { Project } from '../types/dashboard';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => Promise<void>;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('إنشاءات ومباني');
  const [location, setLocation] = useState('');
  const [budgetEGP, setBudgetEGP] = useState('50000000');
  const [manager, setManager] = useState('');
  const [executionRate, setExecutionRate] = useState(10);
  const [initialHandoverRate, setInitialHandoverRate] = useState(0);
  const [status, setStatus] = useState<'completed' | 'in_progress' | 'delayed' | 'at_risk'>('in_progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم المشروع');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        location: location.trim() || 'الموقع الرئيسي',
        budgetEGP: Number(budgetEGP) || 20000000,
        manager: manager.trim() || 'م. أحمد خالد',
        executionRate: Number(executionRate),
        initialHandoverRate: Number(initialHandoverRate),
        finalHandoverRate: 0,
        status,
      });
      // reset form
      setName('');
      setLocation('');
      setManager('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'فشل في إنشاء المشروع');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-sky-100 overflow-hidden text-right">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">إنشاء مشروع هندسي جديد</h3>
              <p className="text-xs text-sky-100">إضافة مشروع إلى محفظة المقاولات والأنظمة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              اسم المشروع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: مجمع الأبراج الذكية - المرحلة 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
              >
                <option value="إنشاءات ومباني">إنشاءات ومباني</option>
                <option value="تشطيبات وأعمال مدنية">تشطيبات وأعمال مدنية</option>
                <option value="بنية تحتية وشبكات">بنية تحتية وشبكات</option>
                <option value="كهروميكانيك (MEP)">كهروميكانيك (MEP)</option>
                <option value="طرق وكباري">طرق وكباري</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة المشروع</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
              >
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتملة</option>
                <option value="delayed">مؤجلة</option>
                <option value="at_risk">معرضة للمخاطر</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الموقع / المدينة</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="مثال: العاصمة الإدارية"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الميزانية التقديرية (ج.م)</label>
              <input
                type="number"
                min="1000000"
                step="500000"
                value={budgetEGP}
                onChange={(e) => setBudgetEGP(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800 tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المهندس المسؤول</label>
            <input
              type="text"
              placeholder="مثال: م. مصطفى إبراهيم"
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>نسبة التنفيذ</span>
                <span className="text-emerald-600 tabular-nums">{executionRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={executionRate}
                onChange={(e) => setExecutionRate(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>التسليم الإبتدائي</span>
                <span className="text-blue-600 tabular-nums">{initialHandoverRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={initialHandoverRate}
                onChange={(e) => setInitialHandoverRate(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? 'جاري الحفظ في الخادم...' : 'حفظ المشروع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
