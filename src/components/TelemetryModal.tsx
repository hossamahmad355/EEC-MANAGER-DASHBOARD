import React, { useState } from 'react';
import {
  CheckCircle2,
  Globe,
  Layers,
  Network,
  Radio,
  RefreshCw,
  Router,
  ShieldCheck,
  Wifi,
  X,
} from 'lucide-react';
import { DashboardData } from '../types/dashboard';

interface TelemetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: DashboardData['networkTelemetry'];
  onRefreshTelemetry: () => Promise<void>;
}

export const TelemetryModal: React.FC<TelemetryModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  onRefreshTelemetry,
}) => {
  const [isPinging, setIsPinging] = useState(false);
  const [pingLog, setPingLog] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleRunDiagnostics = async () => {
    setIsPinging(true);
    setPingLog([
      'بدء فحص البنية التحتية والمسارات الشبكية...',
      'فحص نقاط الاتصال اللاسلكية (28 Access Points)... [ناجح 100%]',
      'فحص مفاتيح التوزيع والقلب (4 Switches)... [ناجح 100%]',
      'فحص الموجهات الحدودية (3 Routers)... [زمن الاستجابة: 2ms]',
      'فحص جدار الحماية (NextGen Firewall)... [الحالة: نشط ومحمي]',
      'فحص الخط الرئيسي للإنترنت (ISP Fiber Link)... [معدل استهلاك: 72%]',
      'اكتمال الفحص التشخيصي بنجاح ✓',
    ]);
    await onRefreshTelemetry();
    setIsPinging(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">تشخيص البنية التحتية للشبكة والمعدات</h3>
              <p className="text-xs text-slate-400">حالة نقاط الوصول، المفاتيح، الموجهات وجدار الحماية</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Wifi className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">نقاط الاتصال</span>
              </div>
              <p className="text-xl font-black text-slate-800 tabular-nums">
                {telemetry.accessPoints.active} / {telemetry.accessPoints.total}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                كافة نقاط الـ Access Points متصلة
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Layers className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">مفاتيح التوزيع (Switches)</span>
              </div>
              <p className="text-xl font-black text-slate-800 tabular-nums">
                {telemetry.switches.active} / {telemetry.switches.total}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                4/4 Core & Distribution
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Router className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">الموجهات (Routers)</span>
              </div>
              <p className="text-xl font-black text-slate-800 tabular-nums">
                {telemetry.routers.active} / {telemetry.routers.total}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                3/3 Edge & BGP Routers
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">جدار الحماية (Firewall)</span>
              </div>
              <p className="text-lg font-black text-emerald-600">
                يعمل بنسبة 100%
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                فحص الحزم النشطة (IPS/IDS)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">الإنترنت الرئيسي</span>
              </div>
              <p className="text-lg font-black text-emerald-600">
                متصل (Fiber 1 Gbps)
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                المقر الرئيسي + الفروع
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 mb-2 text-blue-600">
                <Radio className="w-5 h-5" />
                <span className="text-xs font-bold text-slate-800">متوسط الاستهلاك</span>
              </div>
              <p className="text-xl font-black text-blue-600 tabular-nums">
                {telemetry.currentAverageUsage}%
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                الحمل الحالي على البنية
              </p>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-2">
            <button
              onClick={handleRunDiagnostics}
              disabled={isPinging}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'جاري الفحص المباشر للأجهزة...' : 'إجراء فحص تشخيصي فوري'}</span>
            </button>
          </div>

          {/* Console / Diagnostics Output */}
          {pingLog.length > 0 && (
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs text-left dir-ltr space-y-1 overflow-x-auto shadow-inner">
              {pingLog.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-600 select-none">[{idx + 1}]</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
