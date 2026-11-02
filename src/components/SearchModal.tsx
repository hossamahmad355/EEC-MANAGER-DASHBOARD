import React, { useState } from 'react';
import { Building, MapPin, Search, Server, X } from 'lucide-react';
import { Alert, Project, Site, SystemService } from '../types/dashboard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  sites: Site[];
  services: SystemService[];
  alerts: Alert[];
  onSelectProject: () => void;
  onSelectSite: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  sites,
  services,
  alerts,
  onSelectProject,
  onSelectSite,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingProjects = q
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.manager.toLowerCase().includes(q)
      )
    : [];

  const matchingSites = q
    ? sites.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.location.toLowerCase().includes(q) ||
          s.ip.includes(q)
      )
    : [];

  const matchingServices = q
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.techLabel.toLowerCase().includes(q)
      )
    : [];

  const totalResults = matchingProjects.length + matchingSites.length + matchingServices.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-sky-100 flex flex-col text-right overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="ابحث عن مشروع، موقع، خادم، أو تقرير..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-8 text-xs text-slate-400">
              اكتب للبحث في كافة مشاريع الشركة، الفروع، وخوادم الشبكة
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-8 text-xs text-slate-400">
              لم يتم العثور على نتائج تطابق &quot;{query}&quot;
            </div>
          )}

          {matchingProjects.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-500" />
                <span>المشاريع ({matchingProjects.length})</span>
              </h4>
              <div className="space-y-1.5">
                {matchingProjects.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      onSelectProject();
                    }}
                    className="p-2 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{p.name}</p>
                      <p className="text-[11px] text-slate-400">{p.category} · {p.location}</p>
                    </div>
                    <span className="font-extrabold text-emerald-600 tabular-nums">
                      {p.executionRate}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingSites.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span>المواقع والفروع ({matchingSites.length})</span>
              </h4>
              <div className="space-y-1.5">
                {matchingSites.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onSelectSite();
                    }}
                    className="p-2 rounded-xl hover:bg-sky-50 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{s.name}</p>
                      <p className="text-[11px] text-slate-400">{s.location} · {s.ip}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {s.status === 'connected' ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingServices.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-500" />
                <span>الأنظمة والخدمات ({matchingServices.length})</span>
              </h4>
              <div className="space-y-1.5">
                {matchingServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-2 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800">{srv.name}</p>
                      <p className="text-[11px] text-slate-400">{srv.techLabel} · الجاهزية {srv.uptime}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      يعمل
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
