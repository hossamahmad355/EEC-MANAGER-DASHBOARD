import React, { useState } from 'react';
import { AlertTriangle, Bell, BellRing, Calendar, FileText, LayoutGrid, RefreshCw, Search, ShieldCheck, User } from 'lucide-react';
import { Alert } from '../types/dashboard';
import { NotificationPermissionState } from '../services/notifications';

interface HeaderProps {
  alerts: Alert[];
  onOpenAlerts: () => void;
  onOpenSearch: () => void;
  onRefresh: () => void;
  onOpenReport: () => void;
  onOpenGantt: () => void;
  conflictsCount: number;
  onOpenNotificationSettings: () => void;
  notificationPermission: NotificationPermissionState;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  alerts,
  onOpenAlerts,
  onOpenSearch,
  onRefresh,
  onOpenReport,
  onOpenGantt,
  conflictsCount,
  onOpenNotificationSettings,
  notificationPermission,
  isRefreshing,
}) => {
  const unreadAlertsCount = alerts.filter((a) => !a.resolved).length;
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <header className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-r from-sky-100 via-sky-50 to-blue-100 border border-sky-200 shadow-sm mb-4">
      {/* Background Silhouette of Construction & Modern Buildings */}
      <div className="absolute inset-0 pointer-events-none opacity-25 flex items-end justify-between px-6 overflow-hidden">
        {/* Left skyline crane silhouette */}
        <svg
          viewBox="0 0 400 120"
          className="h-28 text-sky-800"
          fill="currentColor"
        >
          {/* Construction Cranes */}
          <path d="M 50 120 L 50 20 L 160 20 L 140 10 L 40 10 L 40 120 Z" opacity="0.6" />
          <line x1="50" y1="20" x2="160" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="50" y1="20" x2="20" y2="40" stroke="currentColor" strokeWidth="2" />
          <line x1="160" y1="20" x2="160" y2="60" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="155" y="60" width="10" height="8" />
          {/* City Buildings */}
          <rect x="70" y="45" width="22" height="75" />
          <rect x="96" y="30" width="28" height="90" />
          <rect x="130" y="55" width="20" height="65" />
          <rect x="155" y="35" width="30" height="85" />
          <rect x="190" y="50" width="25" height="70" />
          <rect x="220" y="25" width="32" height="95" />
        </svg>

        {/* Center clouds & horizon */}
        <div className="w-1/3 flex justify-center opacity-40">
          <svg viewBox="0 0 200 60" className="w-48 text-sky-400" fill="currentColor">
            <path d="M 20 50 Q 40 30 60 50 Q 80 20 110 45 Q 140 25 170 50 Z" />
          </svg>
        </div>

        {/* Right construction cranes & skyscrapers */}
        <svg
          viewBox="0 0 400 120"
          className="h-28 text-sky-800"
          fill="currentColor"
        >
          <path d="M 280 120 L 280 15 L 180 15 L 200 8 L 290 8 L 290 120 Z" opacity="0.7" />
          <line x1="280" y1="15" x2="180" y2="15" stroke="currentColor" strokeWidth="2" />
          <line x1="280" y1="15" x2="310" y2="35" stroke="currentColor" strokeWidth="2" />
          <line x1="180" y1="15" x2="180" y2="55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
          <rect x="175" y="55" width="10" height="8" />
          <rect x="30" y="40" width="26" height="80" />
          <rect x="62" y="25" width="35" height="95" />
          <rect x="104" y="50" width="24" height="70" />
          <rect x="135" y="30" width="30" height="90" />
          <rect x="320" y="45" width="28" height="75" />
        </svg>
      </div>

      {/* Main Header Content */}
      <div className="relative z-10 px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side (in RTL, rendered on visually left side): User controls, notifications, date */}
        <div className="flex flex-col items-center md:items-start gap-2.5 order-2 md:order-1">
          {/* Top User & Notification Control Pill */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-900 to-sky-800 text-white px-3 py-1.5 rounded-full shadow-md text-sm border border-blue-700/50">
            {/* Search Button */}
            <button
              onClick={onOpenSearch}
              title="بحث سريع"
              className="p-1 text-sky-200 hover:text-white hover:bg-blue-800/70 rounded-full transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                onClick={onOpenAlerts}
                title="التنبيهات والإنذارات"
                className="relative p-1 text-sky-200 hover:text-white hover:bg-blue-800/70 rounded-full transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-blue-900">
                    {unreadAlertsCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Notification Bell */}
            <div className="relative">
              <button
                onClick={onOpenNotificationSettings}
                title={
                  notificationPermission === 'granted'
                    ? 'إشعارات سطح المكتب (Notification API): مفعلة ✓'
                    : 'إعداد إشعارات سطح المكتب (Browser Notifications)'
                }
                className="relative p-1 text-sky-200 hover:text-white hover:bg-blue-800/70 rounded-full transition-colors"
              >
                <BellRing className="w-4 h-4" />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-blue-900 ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-400'
                      : notificationPermission === 'denied'
                      ? 'bg-red-500'
                      : 'bg-amber-400'
                  }`}
                />
              </button>
            </div>

            <div className="w-px h-4 bg-sky-600/60 mx-1" />

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 hover:text-sky-200 transition-colors focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-sky-200/30 flex items-center justify-center text-white">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-xs md:text-sm whitespace-nowrap">
                  المدير العام / مدير الشبكة
                </span>
              </button>

              {profileDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">تسجيل الدخول بصلاحية:</p>
                    <p className="text-sm font-bold text-slate-800">المدير العام التنفيذي</p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>صلاحيات إدارة كاملة (Root Admin)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onRefresh();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>تحديث البيانات الحية</span>
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      onOpenNotificationSettings();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>إعدادات إشعارات سطح المكتب</span>
                    <BellRing className="w-3.5 h-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => {
                      onOpenSearch();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-right px-4 py-2 text-xs text-slate-700 hover:bg-sky-50 flex items-center justify-between"
                  >
                    <span>سجل النشاطات والأذونات</span>
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date Badge & Download Report Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-slate-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm border border-sky-100">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>الثلاثاء، 2 نوفمبر 2026</span>
              <button
                onClick={onRefresh}
                title="تحديث البيانات"
                className="ml-1 text-slate-400 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>

            <button
              onClick={onOpenReport}
              title="تحميل وطباعة تقرير أداء المشاريع الشامل (PDF)"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>تحميل التقرير (PDF)</span>
            </button>

            {/* Gantt Schedule Button with Conflict Alert Badge */}
            <button
              onClick={onOpenGantt}
              title="مخطط جانت الزمني وكشف تعارض مواعيد التسليم"
              className="relative flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all hover:shadow-md cursor-pointer border border-slate-700"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <span>مخطط جانت الزمني</span>
              {conflictsCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5 inline" />
                  <span>{conflictsCount}</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Center: Main Dashboard Title and Welcome text */}
        <div className="text-center order-1 md:order-2 flex-1">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>مرحباً بك</span>
          </h1>
          <p className="text-xs md:text-sm lg:text-base font-semibold text-slate-700 mt-1">
            لوحة التحكم الشاملة - إدارة الشركة والمواقع والبنية التحتية
          </p>
        </div>

        {/* Right Side (in RTL, rendered on visually right side): Company Modern Skyline Logo */}
        <div className="flex items-center gap-3 order-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-tr from-blue-900 via-sky-800 to-blue-700 flex items-center justify-center shadow-md border border-white/60 p-2 text-white">
            {/* Elegant Building Skyscrapers Logo Icon matching image */}
            <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
              {/* Back building */}
              <rect x="8" y="24" width="14" height="34" rx="2" fill="#93c5fd" />
              <line x1="12" y1="28" x2="12" y2="52" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="17" y1="28" x2="17" y2="52" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
              {/* Middle tower */}
              <rect x="24" y="10" width="16" height="48" rx="2" fill="#ffffff" />
              <polygon points="32,2 24,10 40,10" fill="#fbbf24" />
              <line x1="28" y1="16" x2="28" y2="52" stroke="#0284c7" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="36" y1="16" x2="36" y2="52" stroke="#0284c7" strokeWidth="2" strokeDasharray="3,3" />
              {/* Front right building */}
              <rect x="42" y="18" width="14" height="40" rx="2" fill="#bae6fd" />
              <line x1="46" y1="24" x2="46" y2="52" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
              <line x1="51" y1="24" x2="51" y2="52" stroke="#1e3a8a" strokeWidth="2" strokeDasharray="3,3" />
              {/* Ground line */}
              <rect x="4" y="58" width="56" height="3" rx="1.5" fill="#f59e0b" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};
