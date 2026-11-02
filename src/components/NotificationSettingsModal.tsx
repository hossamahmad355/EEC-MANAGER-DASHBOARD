import React, { useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  Laptop,
  Radio,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import {
  NotificationPermissionState,
  notificationService,
} from '../services/notifications';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermissionState;
  onPermissionChange: (newPermission: NotificationPermissionState) => void;
  onTriggerSimulatedAlert: (type: 'site_down' | 'high_task' | 'budget_overrun') => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  permission,
  onPermissionChange,
  onTriggerSimulatedAlert,
}) => {
  const [notifyInfra, setNotifyInfra] = useState(true);
  const [notifyTasks, setNotifyTasks] = useState(true);
  const [notifyBandwidth, setNotifyBandwidth] = useState(true);
  const [notifyBudget, setNotifyBudget] = useState(true);
  const [testSuccess, setTestSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    onPermissionChange(res);
  };

  const handleSendTestNotification = () => {
    const sent = notificationService.sendNotification(
      '🔔 تجربة إشعارات سطح المكتب (Notification API)',
      {
        body: 'نظام إدارة المقاولات والشبكات: الإشعارات تعمل بنجاح وجاهزة لتنبيهك بالحالات الحرجة.',
      }
    );
    if (sent) {
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden font-['Cairo',sans-serif]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">إشعارات سطح المكتب (Browser Notifications)</h3>
              <p className="text-xs text-slate-400">تنبيهات فورية للحالات الحرجة والمهام العاجلة عبر المتصفح</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Permission Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
              permission === 'granted'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : permission === 'denied'
                ? 'bg-red-50/70 border-red-200 text-red-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {permission === 'granted' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {permission === 'denied' && <BellOff className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
              {permission === 'default' && <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}

              <div>
                <h4 className="text-xs font-bold">
                  حالة إذن المتصفح:{' '}
                  {permission === 'granted'
                    ? 'مفعلة بنجاح (Granted)'
                    : permission === 'denied'
                    ? 'تم حظر الإشعارات من المتصفح (Denied)'
                    : 'في انتظار منح الإذن (Default)'}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1">
                  {permission === 'granted'
                    ? 'ستتلقى إشعارات فورية على شاشة حاسوبك حتى عند تصغير النافذة.'
                    : permission === 'denied'
                    ? 'يرجى النقر على أيقونة القفل بجانب شريط عنوان المتصفح والسماح بالإشعارات.'
                    : 'انقر على الزر لمنح الإذن للمتصفح بإرسال تنبيهات سطح المكتب.'}
                </p>
              </div>
            </div>

            {permission !== 'granted' && permission !== 'denied' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 whitespace-nowrap"
              >
                تفعيل الآن
              </button>
            )}
          </div>

          {/* Test Notification Button */}
          {permission === 'granted' && (
            <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <Laptop className="w-4 h-4 text-blue-600" />
                <span>اختبار وصول التنبيه لسطح المكتب</span>
              </div>
              <button
                onClick={handleSendTestNotification}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال إشعار تجريبي</span>
              </button>
            </div>
          )}

          {testSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold text-center animate-in fade-in">
              تم إرسال الإشعار لسطح المكتب بنجاح ✓
            </div>
          )}

          {/* Categories Toggles */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>أنواع التنبيهات التي يتم تفعيلها:</span>
            </h4>

            <div className="space-y-2 text-xs font-semibold">
              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer">
                <span className="text-slate-800">تغيرات البنية التحتية الحرجة (انقطاع موقع أو خادم)</span>
                <input
                  type="checkbox"
                  checked={notifyInfra}
                  onChange={(e) => setNotifyInfra(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer">
                <span className="text-slate-800">المهام والموافقات ذات الأولوية القصوى (High Priority Tasks)</span>
                <input
                  type="checkbox"
                  checked={notifyTasks}
                  onChange={(e) => setNotifyTasks(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer">
                <span className="text-slate-800">ارتفاع استهلاك حزمة الإنترنت عن 80%</span>
                <input
                  type="checkbox"
                  checked={notifyBandwidth}
                  onChange={(e) => setNotifyBandwidth(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-slate-800">تنبيهات تجاوز الميزانية للمشاريع (&gt; 90%)</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifyBudget}
                  onChange={(e) => setNotifyBudget(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600"
                />
              </label>
            </div>
          </div>

          {/* Instant Simulation Section */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>محاكاة الحالات الطارئة الميدانية:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => onTriggerSimulatedAlert('site_down')}
                className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs font-bold text-right transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-red-600" />
                محاكاة انقطاع موقع 7
              </button>
              <button
                onClick={() => onTriggerSimulatedAlert('high_task')}
                className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold text-right transition-colors"
              >
                <Radio className="w-3.5 h-3.5 inline ml-1 text-amber-600" />
                محاكاة مهمة عاجلة
              </button>
              <button
                onClick={() => onTriggerSimulatedAlert('budget_overrun')}
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold text-right transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 inline ml-1 text-rose-600" />
                تجاوز ميزانية مشروع (&gt;90%)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
