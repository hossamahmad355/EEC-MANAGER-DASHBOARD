import React, { useEffect, useState } from 'react';
import { AlertsModal } from './components/AlertsModal';
import { BottomRow } from './components/BottomRow';
import { BudgetTrendChart } from './components/BudgetTrendChart';
import { DocumentsModal } from './components/DocumentsModal';
import { GanttScheduleModal } from './components/GanttScheduleModal';
import { Header } from './components/Header';
import { KpiBar } from './components/KpiBar';
import { MiddleRow } from './components/MiddleRow';
import { NewProjectModal } from './components/NewProjectModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { ProjectsModal } from './components/ProjectsModal';
import { ReportModal } from './components/ReportModal';
import { SearchModal } from './components/SearchModal';
import { SitesModal } from './components/SitesModal';
import { TasksModal } from './components/TasksModal';
import { TelemetryModal } from './components/TelemetryModal';
import {
  NotificationPermissionState,
  notificationService,
} from './services/notifications';
import {
  createProject,
  deleteDocument,
  deleteProject,
  fetchAlerts,
  fetchBudgetTrends,
  fetchDashboardData,
  fetchDocuments,
  fetchGanttSchedule,
  fetchPerformanceReport,
  fetchProjects,
  fetchSites,
  fetchTasks,
  reconnectSite,
  refreshTelemetry,
  resolveAlert,
  toggleServiceStatus,
  toggleTaskCompletion,
  updateProject,
  updateProjectExpenses,
  updateProjectSchedule,
  updateTaskStatus,
  uploadDocument,
} from './services/api';
import {
  Alert,
  BudgetTrendData,
  DashboardData,
  GanttScheduleData,
  PerformanceReport,
  Project,
  ProjectDocument,
  Site,
  SystemService,
  TaskItem,
} from './types/dashboard';

// Fallback initial state in case the server is just booting
const initialFallbackData: DashboardData = {
  kpis: {
    remainingBudget: 380000000,
    remainingBudgetPercentage: 30.4,
    actualCost: 870000000,
    actualCostPercentage: 69.6,
    totalContracts: 1250000000,
    overallCompletionRate: 78,
    completionRateTrend: '+6%',
    totalProjects: 27,
    totalSites: 14,
    totalEmployees: 317,
  },
  projectDistribution: {
    total: 27,
    completed: { count: 6, percentage: '22.2' },
    inProgress: { count: 18, percentage: '66.7' },
    delayed: { count: 2, percentage: '7.4' },
    atRisk: { count: 1, percentage: '3.7' },
  },
  networkTelemetry: {
    accessPoints: { total: 28, active: 28 },
    switches: { total: 4, active: 4 },
    routers: { total: 3, active: 3 },
    firewall: { status: 'operational', name: 'جدار الحماية' },
    internet: { status: 'connected', name: 'الإنترنت' },
    currentAverageUsage: 72,
    trafficHistory: [
      { time: '00:00', usage: 41 },
      { time: '04:00', usage: 48 },
      { time: '08:00', usage: 63 },
      { time: '12:00', usage: 47 },
      { time: '16:00', usage: 72 },
      { time: '20:00', usage: 68 },
    ],
  },
  services: [
    { id: 'srv-1', name: 'الدومين', techLabel: 'Active Directory', status: 'operational', uptime: '99.98%', type: 'windows' },
    { id: 'srv-2', name: 'خادم الملفات', techLabel: 'File Server', status: 'operational', uptime: '99.95%', type: 'files' },
    { id: 'srv-3', name: 'قاعدة البيانات', techLabel: 'SQL Server', status: 'operational', uptime: '99.99%', type: 'database' },
    { id: 'srv-4', name: 'خادم البورتال', techLabel: 'EEC Portal', status: 'operational', uptime: '99.92%', type: 'portal' },
    { id: 'srv-5', name: 'خدمة المصادقة', techLabel: 'NPS / 802.1X', status: 'operational', uptime: '100%', type: 'auth' },
    { id: 'srv-6', name: 'خدمة DHCP', techLabel: 'DHCP', status: 'operational', uptime: '100%', type: 'dhcp' },
    { id: 'srv-7', name: 'خدمة DNS', techLabel: 'DNS', status: 'operational', uptime: '100%', type: 'dns' },
  ],
  alerts: [
    { id: 'alt-1', type: 'danger', message: 'ارتفاع استخدام الإنترنت (85%) في الموقع الرئيسي', timestamp: 'منذ 15 دقيقة', resolved: false },
    { id: 'alt-2', type: 'warning', message: 'فشل في الاتصال بموقع (موقع 7)', timestamp: 'منذ 42 دقيقة', resolved: false },
    { id: 'alt-3', type: 'info', message: 'تحديثات مطلوبة لخوادم النظام (2)', timestamp: 'منذ ساعتين', resolved: false },
  ],
  tasksCounters: {
    pendingApprovals: 12,
    openTickets: 5,
    maintenanceTasks: 7,
    systemUpdates: 3,
  },
  topProjects: [
    { id: 'p-1', name: 'مبنى إداري جديد', category: 'إنشاءات ومباني', executionRate: 82, initialHandoverRate: 70, finalHandoverRate: 0, status: 'in_progress', budgetEGP: 420000000, manager: 'م. أحمد خالد', location: 'العاصمة الإدارية', startDate: '2025-01-15', endDate: '2027-04-30' },
    { id: 'p-2', name: 'تشطيب المقر الرئيسي', category: 'أعمال مدنية وتشطيبات', executionRate: 76, initialHandoverRate: 45, finalHandoverRate: 0, status: 'in_progress', budgetEGP: 185000000, manager: 'م. سارة محمود', location: 'المقر الرئيسي', startDate: '2025-06-01', endDate: '2026-12-15' },
    { id: 'p-3', name: 'مركز بيانات (تيار خفيف وبارد)', category: 'بنية تحتية وشبكات', executionRate: 79, initialHandoverRate: 0, finalHandoverRate: 0, status: 'in_progress', budgetEGP: 95000000, manager: 'م. طارق العوضي', location: 'القرية الذكية', startDate: '2025-09-10', endDate: '2027-02-28' },
    { id: 'p-4', name: 'تطوير نظام التكييف', category: 'كهروميكانيك (MEP)', executionRate: 80, initialHandoverRate: 0, finalHandoverRate: 0, status: 'in_progress', budgetEGP: 65000000, manager: 'م. يوسف إبراهيم', location: 'موقع 1', startDate: '2026-02-01', endDate: '2026-11-30' },
  ],
  topSites: [
    { id: 's-main', name: 'الموقع الرئيسي', isMain: true, status: 'connected', internetUsage: 72, devicesCount: 120, ip: '10.10.1.1', location: 'التجمع الخامس', lastPing: 'منذ لحظات' },
    { id: 's-1', name: 'موقع 1', isMain: false, status: 'connected', internetUsage: 58, devicesCount: 36, ip: '10.10.2.1', location: 'العاصمة الإدارية', lastPing: 'منذ دقيقة' },
    { id: 's-2', name: 'موقع 2', isMain: false, status: 'connected', internetUsage: 64, devicesCount: 28, ip: '10.10.3.1', location: 'السادس من أكتوبر', lastPing: 'منذ دقيقتين' },
    { id: 's-3', name: 'موقع 3', isMain: false, status: 'connected', internetUsage: 49, devicesCount: 31, ip: '10.10.4.1', location: 'العلمين الجديدة', lastPing: 'منذ 3 دقائق' },
    { id: 's-7', name: 'موقع 7', isMain: false, status: 'disconnected', internetUsage: 0, devicesCount: 0, ip: '10.10.7.1', location: 'الإسكندرية', lastPing: 'غير متاح' },
  ],
};

const initialBudgetTrends: BudgetTrendData = {
  title: 'تحليل الميزانية والمصروفات على مدار الـ 6 أشهر الماضية',
  currency: 'مليون ج.م',
  currentRemaining: 380000000,
  currentActual: 870000000,
  totalContracts: 1250000000,
  trends: [
    { month: 'مايو 2026', shortMonth: 'مايو', remainingBudget: 740, actualExpenses: 510, remainingBudgetEGP: 740000000, actualExpensesEGP: 510000000, totalBudget: 1250, burnRate: '68M/شهر' },
    { month: 'يونيو 2026', shortMonth: 'يونيو', remainingBudget: 660, actualExpenses: 590, remainingBudgetEGP: 660000000, actualExpensesEGP: 590000000, totalBudget: 1250, burnRate: '80M/شهر' },
    { month: 'يوليو 2026', shortMonth: 'يوليو', remainingBudget: 590, actualExpenses: 660, remainingBudgetEGP: 590000000, actualExpensesEGP: 660000000, totalBudget: 1250, burnRate: '70M/شهر' },
    { month: 'أغسطس 2026', shortMonth: 'أغسطس', remainingBudget: 515, actualExpenses: 735, remainingBudgetEGP: 515000000, actualExpensesEGP: 735000000, totalBudget: 1250, burnRate: '75M/شهر' },
    { month: 'سبتمبر 2026', shortMonth: 'سبتمبر', remainingBudget: 440, actualExpenses: 810, remainingBudgetEGP: 440000000, actualExpensesEGP: 810000000, totalBudget: 1250, burnRate: '75M/شهر' },
    { month: 'أكتوبر 2026', shortMonth: 'أكتوبر', remainingBudget: 380, actualExpenses: 870, remainingBudgetEGP: 380000000, actualExpensesEGP: 870000000, totalBudget: 1250, burnRate: '60M/شهر' },
  ],
};

export default function App() {
  const [data, setData] = useState<DashboardData>(initialFallbackData);
  const [budgetTrends, setBudgetTrends] = useState<BudgetTrendData>(initialBudgetTrends);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [allTasks, setAllTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Modals
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isSitesModalOpen, setIsSitesModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGanttOpen, setIsGanttOpen] = useState(false);
  const [ganttData, setGanttData] = useState<GanttScheduleData | null>(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [selectedDocProjectId, setSelectedDocProjectId] = useState<string>('all');
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>(
    notificationService.getPermission()
  );
  const [reportData, setReportData] = useState<PerformanceReport | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('eec_dark_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('eec_dark_mode', String(next));
      } catch {}
      return next;
    });
    showToast(isDarkMode ? 'تم الانتقال إلى الوضع العادي (الفاتح)' : 'تم تفعيل الوضع الداكن بنجاح 🌙');
  };

  const [lang, setLang] = useState<'ar' | 'en'>(() => {
    try {
      return (localStorage.getItem('eec_lang') as 'ar' | 'en') || 'ar';
    } catch {
      return 'ar';
    }
  });

  const toggleLanguage = () => {
    setLang((prev) => {
      const next = prev === 'ar' ? 'en' : 'ar';
      try {
        localStorage.setItem('eec_lang', next);
      } catch {}
      return next;
    });
    showToast(lang === 'ar' ? 'Switched to English language 🌐' : 'تم التحويل إلى اللغة العربية 🌐');
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Load Initial Data
  const loadData = async () => {
    try {
      const [dash, projs, sitesList, tasksList, trends, gantt, docs] = await Promise.all([
        fetchDashboardData(),
        fetchProjects(),
        fetchSites(),
        fetchTasks(),
        fetchBudgetTrends().catch(() => initialBudgetTrends),
        fetchGanttSchedule().catch(() => null),
        fetchDocuments().catch(() => []),
      ]);
      setData(dash);
      setAllProjects(projs);
      setAllSites(sitesList);
      setAllTasks(tasksList);
      if (trends) setBudgetTrends(trends);
      if (gantt) setGanttData(gantt);
      if (docs) setDocuments(docs);

      // Automated check: if any project exceeds 90% of budget, dispatch notification
      const overBudgetProjs = projs.filter((p) => {
        const exp = p.actualExpensesEGP !== undefined ? p.actualExpensesEGP : p.budgetEGP * (p.executionRate / 100);
        return (exp / p.budgetEGP) >= 0.90;
      });
      if (overBudgetProjs.length > 0) {
        const p = overBudgetProjs[0];
        const spent = p.actualExpensesEGP || Math.round(p.budgetEGP * 0.93);
        const rate = Number(((spent / p.budgetEGP) * 100).toFixed(1));
        notificationService.notifyBudgetExceeded(p.name, rate, spent, p.budgetEGP);
      }
    } catch (err) {
      console.warn('Backend loading warning, using client fallback:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    showToast('تم تحديث البيانات الحية من الخادم بنجاح');
  };

  const handleCreateProject = async (newProjData: Partial<Project>) => {
    try {
      const created = await createProject(newProjData);
      setAllProjects((prev) => [created, ...prev]);
      // Update top projects in dashboard
      setData((prev) => ({
        ...prev,
        kpis: {
          ...prev.kpis,
          totalProjects: prev.kpis.totalProjects + 1,
        },
        topProjects: [created, ...prev.topProjects.slice(0, 3)],
      }));
      showToast(`تم إنشاء المشروع "${created.name}" وحفظه في قاعدة البيانات`);
    } catch (err: any) {
      showToast(err?.message || 'تعذر إنشاء المشروع');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      setAllProjects((prev) => prev.filter((p) => p.id !== id));
      setData((prev) => ({
        ...prev,
        kpis: {
          ...prev.kpis,
          totalProjects: Math.max(1, prev.kpis.totalProjects - 1),
        },
        topProjects: prev.topProjects.filter((p) => p.id !== id),
      }));
      showToast('تم حذف المشروع بنجاح');
    } catch (err: any) {
      showToast(err?.message || 'تعذر حذف المشروع');
    }
  };

  const handleUpdateProjectProgress = async (id: string, executionRate: number) => {
    try {
      const updated = await updateProject(id, { executionRate });
      setAllProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setData((prev) => ({
        ...prev,
        topProjects: prev.topProjects.map((p) => (p.id === id ? updated : p)),
      }));
      showToast(`تم تحديث نسبة تنفيذ "${updated.name}" إلى ${executionRate}%`);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث المشروع');
    }
  };

  const handleUpdateSchedule = async (id: string, startDate?: string, endDate?: string) => {
    try {
      const res = await updateProjectSchedule(id, startDate, endDate);
      setAllProjects((prev) => prev.map((p) => (p.id === id ? res.project : p)));
      setData((prev) => ({
        ...prev,
        topProjects: prev.topProjects.map((p) => (p.id === id ? res.project : p)),
      }));
      setGanttData((prev) =>
        prev
          ? {
              ...prev,
              projects: prev.projects.map((p) => (p.id === id ? res.project : p)),
              conflicts: res.conflicts,
            }
          : null
      );
      if (res.conflicts.length === 0) {
        notificationService.sendNotification('✅ تم فض وحل تعارضات مواعيد التسليم بنجاح', {
          body: 'كافة مواعيد تسليم المشاريع متناسقة الآن ولا توجد لجان استلام متزامنة.',
        });
      }
      showToast(`تم تعديل موعد تسليم مشروع "${res.project.name}" إلى ${res.project.endDate}`);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث الجدول الزمني للمشروع');
    }
  };

  const handleToggleSiteConnection = async (id: string) => {
    try {
      const updated = await reconnectSite(id);
      setAllSites((prev) => prev.map((s) => (s.id === id ? updated : s)));
      setData((prev) => ({
        ...prev,
        topSites: prev.topSites.map((s) => (s.id === id ? updated : s)),
      }));

      // Trigger browser desktop notification for critical infrastructure change!
      notificationService.notifyInfrastructureChange(
        updated.name,
        updated.status,
        updated.status === 'disconnected'
          ? `🚨 إنذار حرج: تعذر الاتصال بالموقع (${updated.name})، يرجى التدخل الفوري.`
          : `✅ تم استئناف الاتصال بالموقع (${updated.name}) واستقرار الحزمة.`
      );

      showToast(
        updated.status === 'connected'
          ? `تم إعادة الاتصال بموقع "${updated.name}" بنجاح ✓`
          : `تم فصل الموقع "${updated.name}"`
      );
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث اتصال الموقع');
    }
  };

  const handleServiceToggle = async (id: string) => {
    try {
      const updated = await toggleServiceStatus(id);
      setData((prev) => ({
        ...prev,
        services: prev.services.map((s) => (s.id === id ? updated : s)),
      }));

      if (updated.status !== 'operational') {
        notificationService.notifyInfrastructureChange(
          `خدمة ${updated.name} (${updated.techLabel})`,
          'degraded',
          `⚠️ تراجع في كفاءة تشغيل خدمة ${updated.name}. يرجى فحص سجلات الخادم.`
        );
      }

      showToast(`تم تبديل حالة خدمة ${updated.name} (${updated.techLabel})`);
    } catch (err: any) {
      showToast(err?.message || 'تعذر تبديل حالة الخدمة');
    }
  };

  const handleTriggerSimulatedAlert = (type: 'site_down' | 'high_task' | 'budget_overrun') => {
    if (type === 'site_down') {
      notificationService.notifyInfrastructureChange(
        'موقع 7 - برج العرب',
        'disconnected',
        '🚨 إنذار حرج: انقطاع مفاجئ في الخط الرئيسي لشبكة الألياف الضوئية بموقع 7!'
      );
      showToast('تم إرسال إشعار سطح المكتب: انقطاع شبكي حرج في موقع 7');
    } else if (type === 'high_task') {
      notificationService.notifyHighPriorityTask(
        'اعتماد أمر تشغيل خرسانات عاجل لمشروع مبنى إداري جديد',
        'المدير العام',
        'العاصمة الإدارية'
      );
      showToast('تم إرسال إشعار سطح المكتب: مهمة عاجلة جديدة');
    } else if (type === 'budget_overrun') {
      notificationService.notifyBudgetExceeded(
        'تشطيب المقر الرئيسي',
        93.0,
        172000000,
        185000000
      );
      showToast('تم إرسال إشعار سطح المكتب: تنبيه آلي بتجاوز 90% من ميزانية المشروع');
    }
  };

  const handleUpdateProjectExpenses = async (id: string, expensesEGP: number) => {
    try {
      const res = await updateProjectExpenses(id, expensesEGP);
      setAllProjects((prev) => prev.map((p) => (p.id === id ? res.project : p)));
      setData((prev) => ({
        ...prev,
        topProjects: prev.topProjects.map((p) => (p.id === id ? res.project : p)),
        alerts: res.alert
          ? [res.alert, ...prev.alerts.filter((a) => a.id !== res.alert!.id)]
          : prev.alerts,
      }));

      if (res.alertTriggered) {
        notificationService.notifyBudgetExceeded(
          res.project.name,
          res.project.budgetBurnRatePct || 90,
          expensesEGP,
          res.project.budgetEGP
        );
        showToast(`🚨 تنبيه آلي عاجل: تجاوزت مصروفات مشروع "${res.project.name}" نسبة 90%!`);
      } else {
        showToast(res.message);
      }
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث المصروفات الفعلية للمشروع');
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAlert(id);
      setData((prev) => ({
        ...prev,
        alerts: prev.alerts.filter((a) => a.id !== id),
      }));
      showToast('تمت معالجة التنبيه بنجاح وإزالته من القائمة النشطة');
    } catch (err: any) {
      showToast(err?.message || 'تعذر معالجة التنبيه');
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      const updated = await toggleTaskCompletion(id);
      setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast(
        updated.completed
          ? `تم إكمال المهمة: "${updated.title}" ✓`
          : `تمت إعادة فتح المهمة: "${updated.title}"`
      );
    } catch (err: any) {
      showToast(err?.message || 'تعذر تعديل المهمة');
    }
  };

  const handleUploadDocument = async (docData: Partial<ProjectDocument>) => {
    try {
      const created = await uploadDocument(docData);
      setDocuments((prev) => [created, ...prev]);
      showToast(`تم رفع وحفظ المستند "${created.title}" بنجاح في الأرشيف`);
    } catch (err: any) {
      showToast(err?.message || 'تعذر رفع المستند');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast('تم حذف المستند من الأرشيف الرقمي بنجاح');
    } catch (err: any) {
      showToast(err?.message || 'تعذر حذف المستند');
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: 'in_progress' | 'completed' | 'delayed') => {
    try {
      const updated = await updateTaskStatus(id, status);
      setAllTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast(
        `تم تحديث حالة المهمة إلى "${
          status === 'completed' ? 'مكتملة' : status === 'in_progress' ? 'قيد التنفيذ' : 'مؤجلة'
        }"`
      );
    } catch (err: any) {
      showToast(err?.message || 'تعذر تعديل حالة المهمة');
    }
  };

  const handleRefreshTelemetry = async () => {
    try {
      const telemetry = await refreshTelemetry();
      setData((prev) => ({ ...prev, networkTelemetry: telemetry }));
      showToast('تم إجراء قياس حي لمعدل استهلاك الشبكة');
    } catch (err: any) {
      showToast(err?.message || 'تعذر تحديث القياس');
    }
  };

  const handleOpenReport = async () => {
    try {
      const rep = await fetchPerformanceReport();
      setReportData(rep);
      setIsReportModalOpen(true);
    } catch (err) {
      const fallbackRep: PerformanceReport = {
        reportTitle: 'تقرير أداء المشاريع الشامل والإنجاز التنفيذي',
        companyName: 'لوحة التحكم الشاملة - إدارة المقاولات والبنية التحتية',
        generatedAt: new Date().toISOString(),
        generatedAtArabic: '2 نوفمبر 2026',
        generatedBy: 'المدير العام / مدير الشبكة',
        summary: {
          totalProjects: data.kpis.totalProjects,
          completedProjects: data.projectDistribution.completed.count,
          inProgressProjects: data.projectDistribution.inProgress.count,
          delayedProjects: data.projectDistribution.delayed.count,
          atRiskProjects: data.projectDistribution.atRisk.count,
          overallCompletionRate: data.kpis.overallCompletionRate,
          totalContractsBudget: data.kpis.totalContracts,
          actualCostSpent: data.kpis.actualCost,
          remainingBudget: data.kpis.remainingBudget,
          connectedSitesCount: allSites.length > 0 ? allSites.filter((s) => s.status === 'connected').length : 13,
          totalSitesCount: data.kpis.totalSites,
          activeAlertsCount: data.alerts.length,
        },
        projects: (allProjects.length > 0 ? allProjects : data.topProjects).map((p) => ({
          ...p,
          statusArabic:
            p.status === 'completed'
              ? 'مكتملة'
              : p.status === 'in_progress'
              ? 'قيد التنفيذ'
              : p.status === 'delayed'
              ? 'مؤجلة'
              : 'معرضة للمخاطر',
        })),
      };
      setReportData(fallbackRep);
      setIsReportModalOpen(true);
    }
  };

  return (
    <div
      dir={lang}
      className={`min-h-screen p-3 md:p-6 select-none font-['Cairo',sans-serif] transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-100/90 text-slate-800'
      }`}
    >
      {/* Container matching 1440px max width for dashboard layout integrity */}
      <div className="max-w-[1520px] mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-sky-400/30 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{toast}</span>
          </div>
        )}

        {/* 1. Header with Sky Blueprint & Controls */}
        <Header
          alerts={data.alerts}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          onRefresh={handleRefresh}
          onOpenReport={handleOpenReport}
          onOpenGantt={() => setIsGanttOpen(true)}
          conflictsCount={ganttData?.conflicts?.length || 0}
          onOpenDocuments={() => {
            setSelectedDocProjectId('all');
            setIsDocumentsModalOpen(true);
          }}
          documentsCount={documents.length}
          onOpenNotificationSettings={() => setIsNotificationSettingsOpen(true)}
          notificationPermission={notificationPermission}
          isRefreshing={isRefreshing}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          currentLang={lang}
          onToggleLanguage={toggleLanguage}
        />

        {/* 2. Horizontal KPI Strip (7 Cards) */}
        <KpiBar
          kpis={data.kpis}
          onCardClick={(key) => {
            if (key === 'projects') setIsProjectsModalOpen(true);
            else if (key === 'sites') setIsSitesModalOpen(true);
            else if (key === 'employees') setIsTasksModalOpen(true);
            else if (key === 'completion' || key === 'contracts' || key === 'actual_cost' || key === 'remaining_budget') {
              setIsProjectsModalOpen(true);
            }
          }}
        />

        {/* 3. Middle Row: Network Infra, Services, and Project Progress / Alerts */}
        <MiddleRow
          distribution={data.projectDistribution}
          alerts={data.alerts}
          services={data.services}
          telemetry={data.networkTelemetry}
          onOpenAlerts={() => setIsAlertsModalOpen(true)}
          onOpenProjects={() => setIsProjectsModalOpen(true)}
          onServiceToggle={handleServiceToggle}
          onResolveAlert={handleResolveAlert}
          onOpenTelemetryModal={() => setIsTelemetryModalOpen(true)}
        />

        {/* 4. Data Visualization: Budget vs Actual Expenses (Last 6 Months using recharts) */}
        <BudgetTrendChart data={budgetTrends} />

        {/* 5. Bottom Row: Sites Status, Tasks, Create Project CTA, Top Projects */}
        <BottomRow
          topProjects={data.topProjects}
          topSites={data.topSites}
          tasksCounters={data.tasksCounters}
          onOpenNewProject={() => setIsNewProjectOpen(true)}
          onOpenAllProjects={() => setIsProjectsModalOpen(true)}
          onOpenGantt={() => setIsGanttOpen(true)}
          onOpenAllSites={() => setIsSitesModalOpen(true)}
          onOpenAllTasks={() => setIsTasksModalOpen(true)}
          onToggleSiteConnection={handleToggleSiteConnection}
        />
      </div>

      {/* ---------------- Modals ---------------- */}
      {/* Create Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* View All Projects Modal */}
      <ProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={allProjects.length > 0 ? allProjects : data.topProjects}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onDeleteProject={handleDeleteProject}
        onUpdateProjectProgress={handleUpdateProjectProgress}
        onUpdateProjectExpenses={handleUpdateProjectExpenses}
        onOpenProjectDocuments={(projectId) => {
          setSelectedDocProjectId(projectId);
          setIsDocumentsModalOpen(true);
        }}
      />

      {/* View All Sites Modal */}
      <SitesModal
        isOpen={isSitesModalOpen}
        onClose={() => setIsSitesModalOpen(false)}
        sites={allSites.length > 0 ? allSites : data.topSites}
        onToggleConnection={handleToggleSiteConnection}
      />

      {/* View All Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={data.alerts}
        onResolveAlert={handleResolveAlert}
      />

      {/* View All Tasks Modal */}
      <TasksModal
        isOpen={isTasksModalOpen}
        onClose={() => setIsTasksModalOpen(false)}
        tasks={allTasks}
        onToggleTask={handleToggleTask}
        onUpdateStatus={handleUpdateTaskStatus}
      />

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        projects={allProjects.length > 0 ? allProjects : data.topProjects}
        sites={allSites.length > 0 ? allSites : data.topSites}
        services={data.services}
        alerts={data.alerts}
        onSelectProject={() => setIsProjectsModalOpen(true)}
        onSelectSite={() => setIsSitesModalOpen(true)}
      />

      {/* Telemetry Diagnostics Modal */}
      <TelemetryModal
        isOpen={isTelemetryModalOpen}
        onClose={() => setIsTelemetryModalOpen(false)}
        telemetry={data.networkTelemetry}
        onRefreshTelemetry={handleRefreshTelemetry}
      />

      {/* Performance Report Modal with Printable & PDF Download */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={reportData}
      />

      {/* Desktop Notifications Settings & Simulation Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationSettingsOpen}
        onClose={() => setIsNotificationSettingsOpen(false)}
        permission={notificationPermission}
        onPermissionChange={(perm) => setNotificationPermission(perm)}
        onTriggerSimulatedAlert={handleTriggerSimulatedAlert}
      />

      {/* Interactive Gantt Schedule & Handover Conflict Detection Modal */}
      <GanttScheduleModal
        isOpen={isGanttOpen}
        onClose={() => setIsGanttOpen(false)}
        scheduleData={ganttData}
        onUpdateSchedule={handleUpdateSchedule}
        onRefresh={loadData}
      />

      {/* Digital Document Management System (DMS) Modal */}
      <DocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        projects={allProjects.length > 0 ? allProjects : data.topProjects}
        documents={documents}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        onRefresh={loadData}
        initialSelectedProjectId={selectedDocProjectId}
      />
    </div>
  );
}
