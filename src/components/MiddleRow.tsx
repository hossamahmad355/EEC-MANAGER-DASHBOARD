import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FolderTree,
  Globe,
  Info,
  Layers,
  Network,
  Radio,
  Router,
  Server,
  Shield,
  ShieldCheck,
  Wifi,
  Workflow,
  XCircle,
} from 'lucide-react';
import { Alert, DashboardData, SystemService } from '../types/dashboard';

interface MiddleRowProps {
  distribution: DashboardData['projectDistribution'];
  alerts: Alert[];
  services: SystemService[];
  telemetry: DashboardData['networkTelemetry'];
  onOpenAlerts: () => void;
  onOpenProjects: () => void;
  onServiceToggle: (id: string) => void;
  onResolveAlert: (id: string) => void;
  onOpenTelemetryModal: () => void;
}

export const MiddleRow: React.FC<MiddleRowProps> = ({
  distribution,
  alerts,
  services,
  telemetry,
  onOpenAlerts,
  onOpenProjects,
  onServiceToggle,
  onResolveAlert,
  onOpenTelemetryModal,
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Calculate SVG Donut for Project Distribution (Total: 27)
  // Values: completed: 6 (22.2%), inProgress: 18 (66.7%), delayed: 2 (7.4%), atRisk: 1 (3.7%)
  const total = distribution.total || 27;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Offsets for circle strokeDasharray
  const completedLen = (distribution.completed.count / total) * circumference;
  const inProgressLen = (distribution.inProgress.count / total) * circumference;
  const delayedLen = (distribution.delayed.count / total) * circumference;
  const atRiskLen = (distribution.atRisk.count / total) * circumference;

  const inProgressOffset = -completedLen;
  const delayedOffset = -(completedLen + inProgressLen);
  const atRiskOffset = -(completedLen + inProgressLen + delayedLen);

  // Internet Usage SVG Area Chart points
  // 6 points: 00:00 (41%), 04:00 (48%), 08:00 (63%), 12:00 (47%), 16:00 (72%), 20:00 (68%)
  const chartWidth = 260;
  const chartHeight = 110;
  const paddingX = 15;
  const paddingY = 15;
  const history = telemetry.trafficHistory;

  const points = history.map((pt, index) => {
    const x = paddingX + (index / (history.length - 1)) * (chartWidth - 2 * paddingX);
    // Invert Y because 100% is top
    const y = chartHeight - paddingY - (pt.usage / 100) * (chartHeight - 2 * paddingY);
    return { x, y, pt };
  });

  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  // Radial Gauge for Internet Average (72%)
  const gaugeRadius = 38;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeFill = (telemetry.currentAverageUsage / 100) * gaugeCircumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
      {/* ----------------- 1. LEFT CARD: Network Infrastructure Status (col-span-5) ----------------- */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
        {/* Top Part: Network Nodes Status */}
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Network className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm md:text-base">
                حالة البنية التحتية للشبكة
              </h2>
            </div>
            <button
              onClick={onOpenTelemetryModal}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              فحص الأجهزة
            </button>
          </div>

          {/* 5 Network Device Indicators */}
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {/* 1. نقاط الاتصال */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-sky-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                <Wifi className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap mb-1">
                نقاط الاتصال
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 tabular-nums">
                {telemetry.accessPoints.active}/{telemetry.accessPoints.total} ✓
              </span>
            </div>

            {/* 2. المفاتيح */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-sky-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap mb-1">
                المفاتيح
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 tabular-nums">
                {telemetry.switches.active}/{telemetry.switches.total} ✓
              </span>
            </div>

            {/* 3. الموجهات */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-sky-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                <Router className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap mb-1">
                الموجهات
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 tabular-nums">
                {telemetry.routers.active}/{telemetry.routers.total} ✓
              </span>
            </div>

            {/* 4. جدار الحماية */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-sky-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap mb-1">
                جدار الحماية
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                يعمل ✓
              </span>
            </div>

            {/* 5. الإنترنت */}
            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/80 hover:bg-sky-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap mb-1">
                الإنترنت
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                متصل ✓
              </span>
            </div>
          </div>
        </div>

        {/* Lower Part: Internet Usage Chart & Radial Meter */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Workflow className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-xs md:text-sm">
                استخدام الإنترنت
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              معدل الاستهلاك المباشر
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Smooth Bandwidth Timeline Area Chart */}
            <div className="flex-1 relative">
              <div className="flex items-stretch gap-1">
                {/* Y-axis Labels */}
                <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 tabular-nums py-1 select-none">
                  <span>100%</span>
                  <span>80%</span>
                  <span>60%</span>
                  <span>40%</span>
                  <span>20%</span>
                  <span>0%</span>
                </div>

                {/* SVG Area Chart */}
                <div className="flex-1 h-28 relative">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal grid lines */}
                    {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
                      <line
                        key={i}
                        x1={paddingX}
                        y1={paddingY + ratio * (chartHeight - 2 * paddingY)}
                        x2={chartWidth - paddingX}
                        y2={paddingY + ratio * (chartHeight - 2 * paddingY)}
                        stroke="#e2e8f0"
                        strokeDasharray="2,2"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Shaded Area */}
                    <path d={areaD} fill="url(#areaGradient)" />

                    {/* Line Stroke */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Interactive Points */}
                    {points.map((pt, i) => (
                      <g key={i} className="group">
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="3"
                          fill="#ffffff"
                          stroke="#2563eb"
                          strokeWidth="2"
                          className="transition-transform group-hover:scale-150 cursor-pointer"
                        />
                      </g>
                    ))}
                  </svg>

                  {/* X-axis Time Labels */}
                  <div className="flex justify-between text-[9px] font-bold text-slate-500 tabular-nums mt-1 px-2 select-none">
                    {history.map((h, i) => (
                      <span key={i}>{h.time}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Radial Donut Meter for Average Usage */}
            <div className="flex flex-col items-center justify-center shrink-0 w-24">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  {/* Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="transparent"
                    stroke="#0284c7"
                    strokeWidth="10"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeCircumference - gaugeFill}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-800 tabular-nums">
                    {telemetry.currentAverageUsage}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-slate-600 mt-1 whitespace-nowrap">
                متوسط الاستخدام
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- 2. CENTER CARD: Systems & Services Status (col-span-3) ----------------- */}
      <div className="lg:col-span-3 bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Server className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm md:text-base">
                حالة الأنظمة والخدمات
              </h2>
            </div>
          </div>

          {/* List of Services */}
          <div className="space-y-2">
            {services.map((service) => {
              const isOk = service.status === 'operational';
              return (
                <div
                  key={service.id}
                  onClick={() => onServiceToggle(service.id)}
                  title="انقر لتغيير حالة تشغيل الخدمة"
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  {/* Service Name & Tech label */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                      {service.type === 'windows' && <Radio className="w-3.5 h-3.5" />}
                      {service.type === 'files' && <FolderTree className="w-3.5 h-3.5" />}
                      {service.type === 'database' && <Database className="w-3.5 h-3.5" />}
                      {service.type === 'portal' && <Globe className="w-3.5 h-3.5" />}
                      {service.type === 'auth' && <Shield className="w-3.5 h-3.5" />}
                      {service.type === 'dhcp' && <Network className="w-3.5 h-3.5" />}
                      {service.type === 'dns' && <Globe className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {service.name}{' '}
                        <span className="text-[10px] font-medium text-slate-400">
                          ({service.techLabel})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full transition-colors ${
                      isOk
                        ? 'bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200'
                        : 'bg-amber-100 text-amber-800 group-hover:bg-amber-200'
                    }`}
                  >
                    {isOk ? 'يعمل' : 'تحذير'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ----------------- 3. RIGHT CARD: Project Progress & Alerts (col-span-4) ----------------- */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Top Subcard: تقدم المشاريع (Donut Chart) */}
        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Workflow className="w-4 h-4" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm md:text-base">
                تقدم المشاريع
              </h2>
            </div>
            <button
              onClick={onOpenProjects}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              عرض الكل
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            {/* Donut Chart with '27 مشروعاً' */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                {/* Completed (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeDasharray={`${completedLen} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all hover:stroke-emerald-400 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('مكتملة')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* In Progress (Blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#0284c7"
                  strokeWidth="12"
                  strokeDasharray={`${inProgressLen} ${circumference}`}
                  strokeDashoffset={inProgressOffset}
                  className="transition-all hover:stroke-sky-400 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('قيد التنفيذ')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* Delayed (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={`${delayedLen} ${circumference}`}
                  strokeDashoffset={delayedOffset}
                  className="transition-all hover:stroke-amber-400 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('مؤجلة')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
                {/* At Risk (Red) */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={`${atRiskLen} ${circumference}`}
                  strokeDashoffset={atRiskOffset}
                  className="transition-all hover:stroke-rose-400 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('معرضة للمخاطر')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 tabular-nums">
                  {total}
                </span>
                <span className="text-[11px] font-bold text-slate-600">
                  {hoveredSlice || 'مشروعاً'}
                </span>
              </div>
            </div>

            {/* Legend with Counts and Percentages */}
            <div className="flex-1 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span className="font-semibold text-slate-700">مكتملة</span>
                </div>
                <div className="font-extrabold text-slate-800 tabular-nums">
                  {distribution.completed.count}{' '}
                  <span className="text-slate-400 font-normal">
                    ({distribution.completed.percentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-sky-500" />
                  <span className="font-semibold text-slate-700">قيد التنفيذ</span>
                </div>
                <div className="font-extrabold text-slate-800 tabular-nums">
                  {distribution.inProgress.count}{' '}
                  <span className="text-slate-400 font-normal">
                    ({distribution.inProgress.percentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                  <span className="font-semibold text-slate-700">مؤجلة</span>
                </div>
                <div className="font-extrabold text-slate-800 tabular-nums">
                  {distribution.delayed.count}{' '}
                  <span className="text-slate-400 font-normal">
                    ({distribution.delayed.percentage}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                  <span className="font-semibold text-slate-700">معرضة للمخاطر</span>
                </div>
                <div className="font-extrabold text-slate-800 tabular-nums">
                  {distribution.atRisk.count}{' '}
                  <span className="text-slate-400 font-normal">
                    ({distribution.atRisk.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Subcard: التنبيهات والإنذارات */}
        <div className="bg-white rounded-2xl p-4 border border-sky-100 shadow-sm flex-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-extrabold text-slate-800 text-sm">
                التنبيهات والإنذارات
              </h2>
            </div>
            <button
              onClick={onOpenAlerts}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              عرض الكل
            </button>
          </div>

          {/* Alert items */}
          <div className="space-y-2">
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                onClick={() => onResolveAlert(alert.id)}
                title="انقر لتمييز الإنذار كمقروء"
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  {alert.type === 'danger' && (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  {alert.type === 'warning' && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                  {alert.type === 'info' && (
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                  <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {alert.message}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {alert.timestamp}
                </span>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-4 text-xs text-slate-400">
                لا توجد تنبيهات نشطة حالياً ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
