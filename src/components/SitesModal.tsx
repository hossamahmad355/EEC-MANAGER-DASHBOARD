import React from 'react';
import { AlertTriangle, CheckCircle2, MapPin, RefreshCw, Wifi, X } from 'lucide-react';
import { Site } from '../types/dashboard';

interface SitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onToggleConnection: (id: string) => Promise<void>;
}

export const SitesModal: React.FC<SitesModalProps> = ({
  isOpen,
  onClose,
  sites,
  onToggleConnection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">كافة مواقع وفروع الشركة ({sites.length})</h3>
              <p className="text-xs text-slate-400">حالة الربط الشبكي، الأجهزة المتصلة، واستهلاك الحزمة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sites Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-200 text-xs font-bold bg-slate-50">
                <th className="p-3">اسم الموقع</th>
                <th className="p-3">الموقع الجغرافي</th>
                <th className="p-3 text-center">عنوان IP</th>
                <th className="p-3 text-center">حالة الاتصال</th>
                <th className="p-3 text-center">استهلاك الإنترنت</th>
                <th className="p-3 text-center">عدد الأجهزة</th>
                <th className="p-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {sites.map((site) => {
                const isConnected = site.status === 'connected';
                return (
                  <tr key={site.id} className="hover:bg-sky-50/50 transition-colors">
                    {/* الموقع */}
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {site.isMain && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" title="المقر الرئيسي" />
                        )}
                        <span>{site.name}</span>
                      </div>
                    </td>

                    {/* الموقع الجغرافي */}
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {site.location}
                    </td>

                    {/* IP */}
                    <td className="p-3 text-center font-mono text-slate-500 tabular-nums">
                      {site.ip}
                    </td>

                    {/* حالة الاتصال */}
                    <td className="p-3 text-center whitespace-nowrap">
                      {isConnected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          متصل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-700 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          غير متصل
                        </span>
                      )}
                    </td>

                    {/* استخدام الإنترنت */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-bold text-slate-700 tabular-nums w-8">
                          {site.internetUsage}%
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
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
                    <td className="p-3 text-center font-extrabold text-slate-800 tabular-nums">
                      {site.devicesCount > 0 ? `${site.devicesCount} جهاز` : '—'}
                    </td>

                    {/* إجراءات */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleConnection(site.id)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 mx-auto ${
                          isConnected
                            ? 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isConnected ? 'فصل' : 'إعادة الاتصال'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
