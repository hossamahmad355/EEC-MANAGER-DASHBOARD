import React from 'react';
import { AlertTriangle, Check, CheckCheck, Info, X } from 'lucide-react';
import { Alert } from '../types/dashboard';

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onResolveAlert: (id: string) => Promise<void>;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onResolveAlert,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">مركز التنبيهات والإنذارات النشطة</h3>
              <p className="text-xs text-red-100">إشعارات الحوادث الشبكية والتشغيلية والتحديثات</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                alert.type === 'danger'
                  ? 'bg-red-50/70 border-red-200 text-red-900'
                  : alert.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {alert.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />}
                {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />}

                <div>
                  <h4 className="text-xs font-bold leading-snug">{alert.message}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    {alert.location && <span>الموقع: {alert.location}</span>}
                    <span>·</span>
                    <span>{alert.timestamp}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onResolveAlert(alert.id)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-white shadow-sm border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors shrink-0 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>معالجة</span>
              </button>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-bold text-slate-700">كافة التنبيهات معالجة بنجاح</p>
              <p className="text-xs text-slate-400 mt-1">الأنظمة والمواقع تعمل بكفاءة طبيعية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
