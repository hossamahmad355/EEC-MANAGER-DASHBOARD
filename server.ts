import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json());

// In-Memory Database initialized with exact values from the Arabic dashboard
interface Project {
  id: string;
  name: string;
  category: string;
  executionRate: number; // نسبة التنفيذ
  initialHandoverRate: number; // التسليم الإبتدائي
  finalHandoverRate: number; // التسليم النهائي
  status: 'completed' | 'in_progress' | 'delayed' | 'at_risk';
  budgetEGP: number;
  actualExpensesEGP?: number;
  budgetBurnRatePct?: number;
  manager: string;
  location: string;
  startDate: string;
  endDate: string;
}

interface Site {
  id: string;
  name: string;
  isMain: boolean;
  status: 'connected' | 'disconnected' | 'warning';
  internetUsage: number; // %
  devicesCount: number;
  ip: string;
  location: string;
  lastPing: string;
}

interface SystemService {
  id: string;
  name: string;
  techLabel: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  type: 'windows' | 'files' | 'database' | 'portal' | 'auth' | 'dhcp' | 'dns';
}

interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  location?: string;
  timestamp: string;
  resolved: boolean;
}

interface TaskItem {
  id: string;
  category: 'approval' | 'support' | 'maintenance' | 'update';
  title: string;
  projectOrSite: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  completed: boolean;
  status?: 'in_progress' | 'completed' | 'delayed';
}

interface ProjectDocument {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  fileName: string;
  fileExtension: 'pdf' | 'dwg' | 'xlsx' | 'docx' | 'zip';
  fileSizeBytes: number;
  fileSizeFormatted: string;
  category: 'technical' | 'financial' | 'administrative';
  kind: 'contract' | 'blueprint' | 'warranty' | 'permit' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  uploadedAtArabic: string;
  version: string;
  description?: string;
  status: 'active' | 'archived' | 'pending_review';
}

// Initial Data
let projects: Project[] = [
  {
    id: 'p-1',
    name: 'مبنى إداري جديد',
    category: 'إنشاءات ومباني',
    executionRate: 82,
    initialHandoverRate: 70,
    finalHandoverRate: 0,
    status: 'in_progress',
    budgetEGP: 420000000,
    actualExpensesEGP: 345000000,
    budgetBurnRatePct: 82.1,
    manager: 'م. أحمد خالد',
    location: 'العاصمة الإدارية',
    startDate: '2025-01-15',
    endDate: '2027-04-30',
  },
  {
    id: 'p-2',
    name: 'تشطيب المقر الرئيسي',
    category: 'أعمال مدنية وتشطيبات',
    executionRate: 76,
    initialHandoverRate: 45,
    finalHandoverRate: 0,
    status: 'in_progress',
    budgetEGP: 185000000,
    actualExpensesEGP: 172000000,
    budgetBurnRatePct: 93.0,
    manager: 'م. سارة محمود',
    location: 'الموقع الرئيسي - القاهرة',
    startDate: '2025-06-01',
    endDate: '2026-12-15',
  },
  {
    id: 'p-3',
    name: 'مركز بيانات (تيار خفيف وبارد)',
    category: 'بنية تحتية وشبكات',
    executionRate: 79,
    initialHandoverRate: 0,
    finalHandoverRate: 0,
    status: 'in_progress',
    budgetEGP: 95000000,
    actualExpensesEGP: 71000000,
    budgetBurnRatePct: 74.7,
    manager: 'م. طارق العوضي',
    location: 'القرية الذكية',
    startDate: '2025-09-10',
    endDate: '2027-02-28',
  },
  {
    id: 'p-4',
    name: 'تطوير نظام التكييف',
    category: 'كهروميكانيك (MEP)',
    executionRate: 80,
    initialHandoverRate: 0,
    finalHandoverRate: 0,
    status: 'in_progress',
    budgetEGP: 65000000,
    actualExpensesEGP: 60000000,
    budgetBurnRatePct: 92.3,
    manager: 'م. يوسف إبراهيم',
    location: 'الموقع 1 - القاهرة الجديدة',
    startDate: '2026-02-01',
    endDate: '2026-11-30',
  },
  // Additional projects representing the remaining 23 to match total 27
  {
    id: 'p-5',
    name: 'أبراج النيل السكنية - المرحلة 1',
    category: 'أبراج شاهقة',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 110000000,
    manager: 'م. كريم عادل',
    location: 'كورنيش المعادي',
    startDate: '2023-03-01',
    endDate: '2026-08-15',
  },
  {
    id: 'p-6',
    name: 'محطة معالجة المياه المركزية',
    category: 'بنية تحتية',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 80000000,
    manager: 'م. هاني شاكر',
    location: 'السادس من أكتوبر',
    startDate: '2024-01-10',
    endDate: '2026-09-30',
  },
  {
    id: 'p-7',
    name: 'مستشفى الأمل التخصصي',
    category: 'منشآت طبية',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 90000000,
    manager: 'م. مصطفى نور',
    location: 'الشروق',
    startDate: '2023-11-01',
    endDate: '2026-05-15',
  },
  {
    id: 'p-8',
    name: 'مجمع المدارس الدولية',
    category: 'منشآت تعليمية',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 45000000,
    manager: 'م. ندى فاروق',
    location: 'الشيخ زايد',
    startDate: '2024-05-01',
    endDate: '2026-07-20',
  },
  {
    id: 'p-9',
    name: 'توسعة طريق المحور الغربي',
    category: 'طرق وكباري',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 35000000,
    manager: 'م. وليد كمال',
    location: 'الجيزة',
    startDate: '2024-08-01',
    endDate: '2026-06-10',
  },
  {
    id: 'p-10',
    name: 'شبكة الألياف الضوئية للمواقع',
    category: 'اتصالات',
    executionRate: 100,
    initialHandoverRate: 100,
    finalHandoverRate: 100,
    status: 'completed',
    budgetEGP: 20000000,
    manager: 'م. مروان علي',
    location: 'كافة المواقع',
    startDate: '2025-01-01',
    endDate: '2026-10-01',
  },
  {
    id: 'p-11',
    name: 'مشروع مارينا كوست السياحي',
    category: 'منتجعات سياحية',
    executionRate: 35,
    initialHandoverRate: 0,
    finalHandoverRate: 0,
    status: 'delayed',
    budgetEGP: 55000000,
    manager: 'م. عمر مجدي',
    location: 'الساحل الشمالي',
    startDate: '2025-04-01',
    endDate: '2027-08-30',
  },
  {
    id: 'p-12',
    name: 'توسعة مستودعات اللوجستيات',
    category: 'مستودعات وصناعي',
    executionRate: 40,
    initialHandoverRate: 0,
    finalHandoverRate: 0,
    status: 'delayed',
    budgetEGP: 25000000,
    manager: 'م. شريف رأفت',
    location: 'العين السخنة',
    startDate: '2025-07-01',
    endDate: '2027-01-15',
  },
  {
    id: 'p-13',
    name: 'أعمال الحفر والأساسات العميقة (موقع 7)',
    category: 'أعمال تربة وأساسات',
    executionRate: 28,
    initialHandoverRate: 0,
    finalHandoverRate: 0,
    status: 'at_risk',
    budgetEGP: 15000000,
    manager: 'م. ماجد عبد الله',
    location: 'موقع 7 - الإسكندرية',
    startDate: '2026-03-01',
    endDate: '2027-05-20',
  },
  // 14 more in-progress projects to reach 18 in_progress
  ...Array.from({ length: 14 }).map((_, i) => ({
    id: `p-ip-${i + 14}`,
    name: `مشروع التطوير العقاري قطاع (${i + 1})`,
    category: 'إنشاءات عامة',
    executionRate: 60 + ((i * 3) % 25),
    initialHandoverRate: i % 2 === 0 ? 30 : 0,
    finalHandoverRate: 0,
    status: 'in_progress' as const,
    budgetEGP: 20000000 + i * 5000000,
    manager: `م. مهندس قطاع ${i + 1}`,
    location: `موقع ${((i % 7) + 1)}`,
    startDate: '2025-08-01',
    endDate: '2027-09-01',
  })),
];

let sites: Site[] = [
  {
    id: 's-main',
    name: 'الموقع الرئيسي',
    isMain: true,
    status: 'connected',
    internetUsage: 72,
    devicesCount: 120,
    ip: '10.10.1.1',
    location: 'التجمع الخامس، القاهرة الجديدة',
    lastPing: 'منذ لحظات',
  },
  {
    id: 's-1',
    name: 'موقع 1',
    isMain: false,
    status: 'connected',
    internetUsage: 58,
    devicesCount: 36,
    ip: '10.10.2.1',
    location: 'العاصمة الإدارية الجديدة - الحي المالي',
    lastPing: 'منذ دقيقة',
  },
  {
    id: 's-2',
    name: 'موقع 2',
    isMain: false,
    status: 'connected',
    internetUsage: 64,
    devicesCount: 28,
    ip: '10.10.3.1',
    location: 'مدينة السادس من أكتوبر - المنطقة الصناعية',
    lastPing: 'منذ دقيقتين',
  },
  {
    id: 's-3',
    name: 'موقع 3',
    isMain: false,
    status: 'connected',
    internetUsage: 49,
    devicesCount: 31,
    ip: '10.10.4.1',
    location: 'مدينة العلمين الجديدة - أبراج المارينا',
    lastPing: 'منذ 3 دقائق',
  },
  {
    id: 's-7',
    name: 'موقع 7',
    isMain: false,
    status: 'disconnected',
    internetUsage: 0,
    devicesCount: 0,
    ip: '10.10.7.1',
    location: 'برج العرب، الإسكندرية',
    lastPing: 'غير متاح (فشل الاتصال)',
  },
  // Additional sites to reach 14
  {
    id: 's-4',
    name: 'موقع 4',
    isMain: false,
    status: 'connected',
    internetUsage: 42,
    devicesCount: 22,
    ip: '10.10.5.1',
    location: 'العين السخنة - ميناء الحاويات',
    lastPing: 'منذ دقيقة',
  },
  {
    id: 's-5',
    name: 'موقع 5',
    isMain: false,
    status: 'connected',
    internetUsage: 51,
    devicesCount: 19,
    ip: '10.10.6.1',
    location: 'مدينة بدر - المجمع الحرفي',
    lastPing: 'منذ 4 دقائق',
  },
  {
    id: 's-6',
    name: 'موقع 6',
    isMain: false,
    status: 'connected',
    internetUsage: 38,
    devicesCount: 15,
    ip: '10.10.8.1',
    location: 'أسيوط الجديدة',
    lastPing: 'منذ 5 دقائق',
  },
  {
    id: 's-8',
    name: 'موقع 8',
    isMain: false,
    status: 'connected',
    internetUsage: 62,
    devicesCount: 25,
    ip: '10.10.9.1',
    location: 'دمياط الجديدة - الميناء',
    lastPing: 'منذ دقيقة',
  },
  {
    id: 's-9',
    name: 'موقع 9',
    isMain: false,
    status: 'connected',
    internetUsage: 45,
    devicesCount: 14,
    ip: '10.10.10.1',
    location: 'المنصورة الجديدة',
    lastPing: 'منذ دقيقتين',
  },
  {
    id: 's-10',
    name: 'موقع 10',
    isMain: false,
    status: 'connected',
    internetUsage: 33,
    devicesCount: 12,
    ip: '10.10.11.1',
    location: 'بورسعيد - شرق التفريعة',
    lastPing: 'منذ 6 دقائق',
  },
  {
    id: 's-11',
    name: 'موقع 11',
    isMain: false,
    status: 'connected',
    internetUsage: 41,
    devicesCount: 17,
    ip: '10.10.12.1',
    location: 'السويس - المنطقة الحرة',
    lastPing: 'منذ 3 دقائق',
  },
  {
    id: 's-12',
    name: 'موقع 12',
    isMain: false,
    status: 'connected',
    internetUsage: 55,
    devicesCount: 20,
    ip: '10.10.13.1',
    location: 'سوهاج الجديدة',
    lastPing: 'منذ دقيقتين',
  },
  {
    id: 's-13',
    name: 'موقع 13',
    isMain: false,
    status: 'connected',
    internetUsage: 47,
    devicesCount: 18,
    ip: '10.10.14.1',
    location: 'الفيوم - المنطقة الصناعية',
    lastPing: 'منذ 5 دقائق',
  },
];

let systemServices: SystemService[] = [
  { id: 'srv-1', name: 'الدومين', techLabel: 'Active Directory', status: 'operational', uptime: '99.98%', type: 'windows' },
  { id: 'srv-2', name: 'خادم الملفات', techLabel: 'File Server', status: 'operational', uptime: '99.95%', type: 'files' },
  { id: 'srv-3', name: 'قاعدة البيانات', techLabel: 'SQL Server', status: 'operational', uptime: '99.99%', type: 'database' },
  { id: 'srv-4', name: 'خادم البورتال', techLabel: 'EEC Portal', status: 'operational', uptime: '99.92%', type: 'portal' },
  { id: 'srv-5', name: 'خدمة المصادقة', techLabel: 'NPS / 802.1X', status: 'operational', uptime: '100%', type: 'auth' },
  { id: 'srv-6', name: 'خدمة DHCP', techLabel: 'DHCP', status: 'operational', uptime: '100%', type: 'dhcp' },
  { id: 'srv-7', name: 'خدمة DNS', techLabel: 'DNS', status: 'operational', uptime: '100%', type: 'dns' },
];

let alerts: Alert[] = [
  {
    id: 'alt-1',
    type: 'danger',
    message: 'ارتفاع استخدام الإنترنت (85%) في الموقع الرئيسي',
    location: 'الموقع الرئيسي',
    timestamp: 'منذ 15 دقيقة',
    resolved: false,
  },
  {
    id: 'alt-2',
    type: 'warning',
    message: 'فشل في الاتصال بموقع (موقع 7)',
    location: 'موقع 7 - الإسكندرية',
    timestamp: 'منذ 42 دقيقة',
    resolved: false,
  },
  {
    id: 'alt-3',
    type: 'info',
    message: 'تحديثات مطلوبة لخوادم النظام (2)',
    location: 'مركز البيانات الرئيسي',
    timestamp: 'منذ ساعتين',
    resolved: false,
  },
];

let tasks: TaskItem[] = [
  { id: 't-1', category: 'approval', title: 'موافقة على مستخلص مقاول باطن - خرسانات', projectOrSite: 'مبنى إداري جديد', priority: 'high', assignedTo: 'المدير العام', dueDate: '2026-11-03', completed: false, status: 'in_progress' },
  { id: 't-2', category: 'approval', title: 'اعتماد عينات رخام الواجهات الرئيسية', projectOrSite: 'تشطيب المقر الرئيسي', priority: 'medium', assignedTo: 'المدير الفني', dueDate: '2026-11-04', completed: false, status: 'in_progress' },
  { id: 't-3', category: 'approval', title: 'طلب شراء كابلات شبكة Cat6A ومسارات', projectOrSite: 'مركز بيانات', priority: 'high', assignedTo: 'مدير الشبكة', dueDate: '2026-11-01', completed: false, status: 'delayed' },
  { id: 't-4', category: 'support', title: 'بطء في تصفح بوابة الشركة في موقع 2', projectOrSite: 'موقع 2', priority: 'medium', assignedTo: 'دعم الشبكات', dueDate: '2026-11-02', completed: false, status: 'in_progress' },
  { id: 't-5', category: 'support', title: 'طلب طابعة شبكية جديدة لمكتب الموقع', projectOrSite: 'موقع 1', priority: 'low', assignedTo: 'الدعم الميداني', dueDate: '2026-10-28', completed: true, status: 'completed' },
  { id: 't-6', category: 'maintenance', title: 'صيانة وقائية دورية لوحدات UPS', projectOrSite: 'المقر الرئيسي', priority: 'medium', assignedTo: 'فريق الكهروميكانيك', dueDate: '2026-11-06', completed: false, status: 'in_progress' },
  { id: 't-7', category: 'maintenance', title: 'فحص أنظمة مكافحة الحريق بالغاز FM200', projectOrSite: 'مركز بيانات', priority: 'high', assignedTo: 'إدارة السلامة', dueDate: '2026-10-25', completed: false, status: 'delayed' },
  { id: 't-8', category: 'update', title: 'تحديث حزم الأمان الشهرية لنظام Windows Server', projectOrSite: 'Active Directory', priority: 'high', assignedTo: 'مهندس النظم', dueDate: '2026-10-30', completed: true, status: 'completed' },
  { id: 't-9', category: 'update', title: 'ترقية شهادات الأمان SSL للبوابة الداخلية', projectOrSite: 'EEC Portal', priority: 'medium', assignedTo: 'أمن المعلومات', dueDate: '2026-11-05', completed: false, status: 'in_progress' },
  { id: 't-10', category: 'approval', title: 'مراجعة التراخيص البيئية لمحطة الصرف', projectOrSite: 'موقع 3', priority: 'high', assignedTo: 'المستشار البيئي', dueDate: '2026-10-20', completed: false, status: 'delayed' },
  { id: 't-11', category: 'maintenance', title: 'اختبار مولدات الطوارئ الديزل الاحتياطية', projectOrSite: 'الموقع الرئيسي', priority: 'low', assignedTo: 'قسم الصيانة', dueDate: '2026-10-29', completed: true, status: 'completed' },
  { id: 't-12', category: 'support', title: 'تهيئة 10 أجهزة حاسوب للمهندسين الجدد', projectOrSite: 'المقر الرئيسي', priority: 'medium', assignedTo: 'الدعم الفني', dueDate: '2026-10-31', completed: true, status: 'completed' },
];

let networkTelemetry = {
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
};

// ----------------- API Endpoints -----------------

// 1. Dashboard Aggregate
app.get('/api/dashboard', (_req: Request, res: Response) => {
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const delayedCount = projects.filter((p) => p.status === 'delayed').length;
  const atRiskCount = projects.filter((p) => p.status === 'at_risk').length;
  const totalCount = projects.length;

  res.json({
    kpis: {
      remainingBudget: 380000000,
      remainingBudgetPercentage: 30.4,
      actualCost: 870000000,
      actualCostPercentage: 69.6,
      totalContracts: 1250000000,
      overallCompletionRate: 78,
      completionRateTrend: '+6%',
      totalProjects: totalCount,
      totalSites: sites.length,
      totalEmployees: 317,
    },
    projectDistribution: {
      total: totalCount,
      completed: { count: completedCount, percentage: ((completedCount / totalCount) * 100).toFixed(1) },
      inProgress: { count: inProgressCount, percentage: ((inProgressCount / totalCount) * 100).toFixed(1) },
      delayed: { count: delayedCount, percentage: ((delayedCount / totalCount) * 100).toFixed(1) },
      atRisk: { count: atRiskCount, percentage: ((atRiskCount / totalCount) * 100).toFixed(1) },
    },
    networkTelemetry,
    services: systemServices,
    alerts: alerts.filter((a) => !a.resolved),
    tasksCounters: {
      pendingApprovals: 12,
      openTickets: 5,
      maintenanceTasks: 7,
      systemUpdates: 3,
    },
    topProjects: projects.slice(0, 4),
    topSites: sites.slice(0, 5),
  });
});

// 2. Projects CRUD & Filter
app.get('/api/projects', (req: Request, res: Response) => {
  const { status, search } = req.query;
  let filtered = [...projects];

  if (status && status !== 'all') {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.manager.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { name, category, executionRate, initialHandoverRate, finalHandoverRate, status, budgetEGP, manager, location } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'اسم المشروع والتصنيف مطلوبان' });
  }

  const newProject: Project = {
    id: `p-${Date.now()}`,
    name,
    category,
    executionRate: Number(executionRate) || 0,
    initialHandoverRate: Number(initialHandoverRate) || 0,
    finalHandoverRate: Number(finalHandoverRate) || 0,
    status: status || 'in_progress',
    budgetEGP: Number(budgetEGP) || 10000000,
    manager: manager || 'م. أحمد خالد',
    location: location || 'الموقع الرئيسي',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2027-12-31',
  };

  // Insert at top of array so it immediately appears in top active projects
  projects.unshift(newProject);
  res.status(201).json(newProject);
});

app.put('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(400).json({ error: 'المشروع غير موجود' });
  }

  projects[index] = { ...projects[index], ...req.body };
  res.json(projects[index]);
});

app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  projects = projects.filter((p) => p.id !== id);
  res.json({ success: true, message: 'تم حذف المشروع بنجاح' });
});

// Automated Budget Scan Helper (> 90% threshold)
function checkAndTriggerBudgetAlerts() {
  projects.forEach((p) => {
    if (p.actualExpensesEGP === undefined) {
      p.actualExpensesEGP = Math.round(p.budgetEGP * (p.executionRate / 100));
    }
    const burnRatePct = (p.actualExpensesEGP / p.budgetEGP) * 100;
    p.budgetBurnRatePct = Number(burnRatePct.toFixed(1));

    if (burnRatePct >= 90) {
      const alertId = `alt-budget-${p.id}`;
      const existing = alerts.find((a) => a.id === alertId);
      const spentM = (p.actualExpensesEGP / 1000000).toFixed(1);
      const budgetM = (p.budgetEGP / 1000000).toFixed(1);
      const alertMsg = `🚨 تجاوز ميزانية حرج: بلغت مصروفات مشروع "${p.name}" ${p.budgetBurnRatePct}% من الميزانية (${spentM}M من أصل ${budgetM}M ج.م)`;
      if (!existing) {
        alerts.unshift({
          id: alertId,
          type: 'danger',
          message: alertMsg,
          location: p.location,
          timestamp: 'الآن (آلي)',
          resolved: false,
        });
      } else {
        existing.message = alertMsg;
      }
    }
  });
}

// Initial budget alert scan
checkAndTriggerBudgetAlerts();

// Update Project Expenses & Automatically check for >90% budget overrun
app.put('/api/projects/:id/expenses', (req: Request, res: Response) => {
  const { id } = req.params;
  const { actualExpensesEGP } = req.body;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'المشروع غير موجود' });
  }

  const expNum = Number(actualExpensesEGP);
  if (isNaN(expNum) || expNum < 0) {
    return res.status(400).json({ error: 'القيمة المدخلة للمصروفات غير صالحة' });
  }

  project.actualExpensesEGP = expNum;
  const burnRatePct = (expNum / project.budgetEGP) * 100;
  project.budgetBurnRatePct = Number(burnRatePct.toFixed(1));

  let alertTriggered = false;
  let newAlert: Alert | null = null;

  if (burnRatePct >= 90) {
    alertTriggered = true;
    const alertId = `alt-budget-${project.id}`;
    const spentM = (expNum / 1000000).toFixed(1);
    const budgetM = (project.budgetEGP / 1000000).toFixed(1);
    const alertMsg = `🚨 تجاوز ميزانية حرج: بلغت مصروفات مشروع "${project.name}" ${project.budgetBurnRatePct}% من الميزانية (${spentM}M من أصل ${budgetM}M ج.م)`;

    const existing = alerts.find((a) => a.id === alertId);
    if (!existing) {
      newAlert = {
        id: alertId,
        type: 'danger',
        message: alertMsg,
        location: project.location,
        timestamp: 'الآن (آلي)',
        resolved: false,
      };
      alerts.unshift(newAlert);
    } else {
      existing.resolved = false;
      existing.message = alertMsg;
      newAlert = existing;
    }
  }

  res.json({
    project,
    alertTriggered,
    alert: newAlert,
    message: alertTriggered
      ? `تحذير عاجل: تجاوزت المصروفات نسبة 90% وتم إرسال تنبيه مالي آلي!`
      : `تم تحديث المصروفات الفعلية للمشروع بنجاح`,
  });
});

// 3. Sites endpoints
app.get('/api/sites', (_req: Request, res: Response) => {
  res.json(sites);
});

app.post('/api/sites/:id/reconnect', (req: Request, res: Response) => {
  const { id } = req.params;
  const site = sites.find((s) => s.id === id);

  if (!site) {
    return res.status(404).json({ error: 'الموقع غير موجود' });
  }

  if (site.status === 'disconnected') {
    site.status = 'connected';
    site.internetUsage = Math.floor(Math.random() * 30) + 40;
    site.devicesCount = 24;
    site.lastPing = 'منذ ثوانٍ معدودة (تمت إعادة الاتصال)';
  } else {
    site.status = 'disconnected';
    site.internetUsage = 0;
    site.devicesCount = 0;
    site.lastPing = 'غير متصل (تم قطع الاتصال يدوياً)';
  }

  res.json(site);
});

// 4. Services endpoints
app.get('/api/services', (_req: Request, res: Response) => {
  res.json(systemServices);
});

app.post('/api/services/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const srv = systemServices.find((s) => s.id === id);

  if (!srv) {
    return res.status(404).json({ error: 'الخدمة غير موجودة' });
  }

  srv.status = srv.status === 'operational' ? 'degraded' : 'operational';
  res.json(srv);
});

// 5. Alerts endpoints
app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json(alerts);
});

app.post('/api/alerts/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const alert = alerts.find((a) => a.id === id);

  if (!alert) {
    return res.status(404).json({ error: 'الإنذار غير موجود' });
  }

  alert.resolved = true;
  res.json({ success: true, alert });
});

// 6. Tasks endpoints
app.get('/api/tasks', (_req: Request, res: Response) => {
  res.json(tasks);
});

app.post('/api/tasks/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'المهمة غير موجودة' });
  }

  task.completed = !task.completed;
  if (task.completed) {
    task.status = 'completed';
  } else {
    const dueDatePassed = new Date(task.dueDate).getTime() < new Date('2026-11-02').getTime();
    task.status = dueDatePassed ? 'delayed' : 'in_progress';
  }
  res.json(task);
});

app.put('/api/tasks/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'المهمة غير موجودة' });
  }

  if (['in_progress', 'completed', 'delayed'].includes(status)) {
    task.status = status;
    task.completed = status === 'completed';
  }
  res.json(task);
});

// 7. Network Telemetry refresh
app.post('/api/telemetry/refresh', (_req: Request, res: Response) => {
  const randomUsage = Math.floor(Math.random() * 15) + 65;
  networkTelemetry.currentAverageUsage = randomUsage;
  networkTelemetry.trafficHistory[networkTelemetry.trafficHistory.length - 1].usage = randomUsage;
  res.json(networkTelemetry);
});

// 8. Performance Report Endpoint
app.get('/api/reports/performance', (_req: Request, res: Response) => {
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const delayedCount = projects.filter((p) => p.status === 'delayed').length;
  const atRiskCount = projects.filter((p) => p.status === 'at_risk').length;
  const totalCount = projects.length;

  const totalBudget = projects.reduce((acc, p) => acc + (p.budgetEGP || 0), 0);
  const actualCost = 870000000;
  const remainingBudget = 380000000;

  const projectPerformanceList = projects.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    manager: p.manager,
    location: p.location,
    budgetEGP: p.budgetEGP,
    executionRate: p.executionRate,
    initialHandoverRate: p.initialHandoverRate,
    finalHandoverRate: p.finalHandoverRate,
    status: p.status,
    statusArabic:
      p.status === 'completed'
        ? 'مكتملة'
        : p.status === 'in_progress'
        ? 'قيد التنفيذ'
        : p.status === 'delayed'
        ? 'مؤجلة'
        : 'معرضة للمخاطر',
    startDate: p.startDate,
    endDate: p.endDate,
  }));

  res.json({
    reportTitle: 'تقرير أداء المشاريع الشامل والإنجاز التنفيذي',
    companyName: 'لوحة التحكم الشاملة - إدارة المقاولات والبنية التحتية',
    generatedAt: new Date().toISOString(),
    generatedAtArabic: '2 نوفمبر 2026',
    generatedBy: 'المدير العام / مدير الشبكة',
    summary: {
      totalProjects: totalCount,
      completedProjects: completedCount,
      inProgressProjects: inProgressCount,
      delayedProjects: delayedCount,
      atRiskProjects: atRiskCount,
      overallCompletionRate: 78,
      totalContractsBudget: 1250000000,
      actualCostSpent: actualCost,
      remainingBudget: remainingBudget,
      connectedSitesCount: sites.filter((s) => s.status === 'connected').length,
      totalSitesCount: sites.length,
      activeAlertsCount: alerts.filter((a) => !a.resolved).length,
    },
    projects: projectPerformanceList,
  });
});

// 9. Financials Budget Trend Endpoint (Last 6 Months)
app.get('/api/financials/budget-trend', (_req: Request, res: Response) => {
  const trendData = [
    {
      month: 'مايو 2026',
      shortMonth: 'مايو',
      remainingBudget: 740, // 740M
      actualExpenses: 510, // 510M
      remainingBudgetEGP: 740000000,
      actualExpensesEGP: 510000000,
      totalBudget: 1250,
      burnRate: '68M/شهر',
    },
    {
      month: 'يونيو 2026',
      shortMonth: 'يونيو',
      remainingBudget: 660,
      actualExpenses: 590,
      remainingBudgetEGP: 660000000,
      actualExpensesEGP: 590000000,
      totalBudget: 1250,
      burnRate: '80M/شهر',
    },
    {
      month: 'يوليو 2026',
      shortMonth: 'يوليو',
      remainingBudget: 590,
      actualExpenses: 660,
      remainingBudgetEGP: 590000000,
      actualExpensesEGP: 660000000,
      totalBudget: 1250,
      burnRate: '70M/شهر',
    },
    {
      month: 'أغسطس 2026',
      shortMonth: 'أغسطس',
      remainingBudget: 515,
      actualExpenses: 735,
      remainingBudgetEGP: 515000000,
      actualExpensesEGP: 735000000,
      totalBudget: 1250,
      burnRate: '75M/شهر',
    },
    {
      month: 'سبتمبر 2026',
      shortMonth: 'سبتمبر',
      remainingBudget: 440,
      actualExpenses: 810,
      remainingBudgetEGP: 440000000,
      actualExpensesEGP: 810000000,
      totalBudget: 1250,
      burnRate: '75M/شهر',
    },
    {
      month: 'أكتوبر 2026',
      shortMonth: 'أكتوبر',
      remainingBudget: 380,
      actualExpenses: 870,
      remainingBudgetEGP: 380000000,
      actualExpensesEGP: 870000000,
      totalBudget: 1250,
      burnRate: '60M/شهر',
    },
  ];

  res.json({
    title: 'تحليل الميزانية والمصروفات على مدار الـ 6 أشهر الماضية',
    currency: 'مليون ج.م',
    currentRemaining: 380000000,
    currentActual: 870000000,
    totalContracts: 1250000000,
    trends: trendData,
  });
});

// 10. Conflict Detection Helper & Gantt Schedule Endpoints
function detectScheduleConflicts(projList: Project[]) {
  const conflicts: any[] = [];
  const activeProjects = projList.filter(
    (p) => p.status === 'in_progress' || p.status === 'delayed' || p.status === 'at_risk'
  );

  // 1. Direct Handover Conflict: Multiple projects ending within 20 days of each other
  for (let i = 0; i < activeProjects.length; i++) {
    for (let j = i + 1; j < activeProjects.length; j++) {
      const p1 = activeProjects[i];
      const p2 = activeProjects[j];
      const d1 = new Date(p1.endDate).getTime();
      const d2 = new Date(p2.endDate).getTime();
      const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);

      if (diffDays <= 20) {
        conflicts.push({
          id: `conf-${p1.id}-${p2.id}`,
          type: 'direct_handover_overlap',
          severity: diffDays <= 15 ? 'high' : 'medium',
          projectIds: [p1.id, p2.id],
          projectNames: [p1.name, p2.name],
          title: `تعارض تسليم متزامن: "${p1.name}" و "${p2.name}"`,
          description: `الفارق الزمني بين موعدي التسليم النهائي للمشروعين هو ${Math.round(diffDays)} يوماً فقط (${p1.endDate} و ${p2.endDate})، مما يسبب ضغطاً حاداً على لجان الاستلام الهندسي والتحقق الفني.`,
          handoverDates: [p1.endDate, p2.endDate],
          suggestedAction: `ترحيل موعد تسليم "${p2.name}" بمقدار 30 يوماً إضافية لتفادي التداخل في أعمال الفحص الميداني.`,
        });
      }
    }
  }

  // 2. Delayed project risk
  const now = new Date('2026-11-02').getTime();
  activeProjects.forEach((p) => {
    if (p.status === 'delayed' || p.status === 'at_risk') {
      const end = new Date(p.endDate).getTime();
      const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
      if (daysLeft < 120 && p.executionRate < 45) {
        conflicts.push({
          id: `conf-risk-${p.id}`,
          type: 'delayed_risk',
          severity: 'high',
          projectIds: [p.id],
          projectNames: [p.name],
          title: `خطر تأخر التسليم: "${p.name}"`,
          description: `المشروع مصنف بحالة حرجة (${p.status === 'at_risk' ? 'معرض للمخاطر' : 'مؤجل'}) بنسبة إنجاز ${p.executionRate}% فقط مع اقتراب موعد التسليم في ${p.endDate}.`,
          handoverDates: [p.endDate],
          suggestedAction: `تعديل البرنامج الزمني وتمديد مهلة التسليم إلى منتصف 2027 مع تعزيز المقاولين.`,
        });
      }
    }
  });

  return conflicts;
}

app.get('/api/schedule/gantt', (_req: Request, res: Response) => {
  const conflicts = detectScheduleConflicts(projects);
  res.json({
    projects,
    conflicts,
    timelineStart: '2025-01-01',
    timelineEnd: '2027-12-31',
    currentDate: '2026-11-02',
  });
});

app.put('/api/projects/:id/schedule', (req: Request, res: Response) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body;
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'المشروع غير موجود' });
  }

  if (startDate) project.startDate = startDate;
  if (endDate) project.endDate = endDate;

  const conflicts = detectScheduleConflicts(projects);
  res.json({
    project,
    conflicts,
    message: 'تم تحديث التواريخ الزمنية للمشروع بنجاح',
  });
});

// 11. Digital Document Management System (DMS)
let projectDocuments: ProjectDocument[] = [
  // مبنى إداري جديد (p-1)
  {
    id: 'doc-1',
    projectId: 'p-1',
    projectName: 'مبنى إداري جديد',
    title: 'عقد المقاولة العامة الإنشائية المعتمد مع المالك',
    fileName: 'Contract_Civil_Construction_AdminBldg_Signed.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 5240000,
    fileSizeFormatted: '5.2 MB',
    category: 'financial',
    kind: 'contract',
    uploadedBy: 'المستشار القانوني / م. أحمد عبد العزيز',
    uploadedAt: '2025-01-20',
    uploadedAtArabic: '20 يناير 2025',
    version: 'v1.0 (معتمد)',
    description: 'العقد الابتدائي والتفصيلي الشامل لكافة بنود الخرسانات والهيكل والبنود الإلزامية.',
    status: 'active',
  },
  {
    id: 'doc-2',
    projectId: 'p-1',
    projectName: 'مبنى إداري جديد',
    title: 'المخططات التنفيذية الإنشائية والمعمارية الشاملة (BIM / CAD)',
    fileName: 'Architectural_Executive_Drawings_Full_Set_Rev4.dwg',
    fileExtension: 'dwg',
    fileSizeBytes: 42100000,
    fileSizeFormatted: '42.1 MB',
    category: 'technical',
    kind: 'blueprint',
    uploadedBy: 'المكتب الاستشاري العام',
    uploadedAt: '2025-03-12',
    uploadedAtArabic: '12 مارس 2025',
    version: 'v4.2',
    description: 'الرسومات التنفيذية المعتمدة لكافة الأدوار ومسارات الهروب والواجهات الزجاجية.',
    status: 'active',
  },
  {
    id: 'doc-3',
    projectId: 'p-1',
    projectName: 'مبنى إداري جديد',
    title: 'شهادة ضمان الهيكل الخرساني والأساسات العميقة (10 سنوات)',
    fileName: 'Concrete_Structure_10Years_Warranty_Cert.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 1450000,
    fileSizeFormatted: '1.4 MB',
    category: 'administrative',
    kind: 'warranty',
    uploadedBy: 'مختبر جودة الخرسانة والمواد',
    uploadedAt: '2025-08-15',
    uploadedAtArabic: '15 أغسطس 2025',
    version: 'v1.0',
    description: 'شهادة ضمان معتمدة من الجمعية الهندسية لمقاومة الإجهادات والعزل الإنشائي.',
    status: 'active',
  },
  {
    id: 'doc-4',
    projectId: 'p-1',
    projectName: 'مبنى إداري جديد',
    title: 'مخطط تمديد كابلات شبكة التيار الخفيف والألياف الضوئية',
    fileName: 'Low_Current_Network_Riser_Diagram.dwg',
    fileExtension: 'dwg',
    fileSizeBytes: 18200000,
    fileSizeFormatted: '18.2 MB',
    category: 'technical',
    kind: 'blueprint',
    uploadedBy: 'مهندس اتصالات / م. طارق العوضي',
    uploadedAt: '2026-02-10',
    uploadedAtArabic: '10 فبراير 2026',
    version: 'v2.1',
    description: 'مسارات غرف الاتصالات IDF/MDF ونقاط الربط اللاسلكي APs وكاميرات المراقبة CCTV.',
    status: 'active',
  },

  // تشطيب المقر الرئيسي (p-2)
  {
    id: 'doc-5',
    projectId: 'p-2',
    projectName: 'تشطيب المقر الرئيسي',
    title: 'عقد مقاولة التشطيبات المعمارية والديكور الداخلي',
    fileName: 'HQ_Interior_Fitout_Contract_2025.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 3800000,
    fileSizeFormatted: '3.8 MB',
    category: 'financial',
    kind: 'contract',
    uploadedBy: 'مدير العقود والمشتريات',
    uploadedAt: '2025-06-05',
    uploadedAtArabic: '5 يونيو 2025',
    version: 'v1.0',
    description: 'عقد التوريد والتركيب للرخام، الأسقف الجبسية، والقواطع الزجاجية الذكية.',
    status: 'active',
  },
  {
    id: 'doc-6',
    projectId: 'p-2',
    projectName: 'تشطيب المقر الرئيسي',
    title: 'مخططات شبكة توزيع مجاري الهواء والتكييف المركزي (HVAC)',
    fileName: 'HQ_HVAC_Ducting_Layout_Floorplans.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 8900000,
    fileSizeFormatted: '8.9 MB',
    category: 'technical',
    kind: 'blueprint',
    uploadedBy: 'مهندس الميكانيكا / م. سارة محمود',
    uploadedAt: '2025-09-18',
    uploadedAtArabic: '18 سبتمبر 2025',
    version: 'v3.0',
    description: 'توزيع مخارج الهواء VAV وحسابات تدفق الهواء CFM للمكاتب وقاعات الاجتماعات.',
    status: 'active',
  },
  {
    id: 'doc-7',
    projectId: 'p-2',
    projectName: 'تشطيب المقر الرئيسي',
    title: 'شهادة ضمان أعمال العزل المائي والحراري للأسطح والواجهات',
    fileName: 'Roof_Waterproofing_Insulation_Warranty_7Y.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 980000,
    fileSizeFormatted: '980 KB',
    category: 'administrative',
    kind: 'warranty',
    uploadedBy: 'شركة العزل الحديثة',
    uploadedAt: '2026-04-22',
    uploadedAtArabic: '22 أبريل 2026',
    version: 'v1.0',
    description: 'شهادة ضمان سارية لمدة 7 سنوات ضد تسريب المياه وتلف الأغشية العازلة.',
    status: 'active',
  },

  // مركز بيانات (تيار خفيف وبارد) (p-3)
  {
    id: 'doc-8',
    projectId: 'p-3',
    projectName: 'مركز بيانات (تيار خفيف وبارد)',
    title: 'عقد توريد وتركيب خوادم البنية التحتية وكبائن Racks',
    fileName: 'DataCenter_Tier3_Servers_Supply_Contract.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 6100000,
    fileSizeFormatted: '6.1 MB',
    category: 'financial',
    kind: 'contract',
    uploadedBy: 'إدارة الشبكات وتكنولوجيا المعلومات',
    uploadedAt: '2025-09-25',
    uploadedAtArabic: '25 سبتمبر 2025',
    version: 'v1.2',
    description: 'اتفاقية توريد 16 كابينة خوادم مزودة بموزعات طاقة ذكية PDUs وحساسات حرارية.',
    status: 'active',
  },
  {
    id: 'doc-9',
    projectId: 'p-3',
    projectName: 'مركز بيانات (تيار خفيف وبارد)',
    title: 'مخطط التصميم الهندسي لممرات الهواء البارد والساخن (Containment)',
    fileName: 'DataCenter_Cold_Aisle_Containment_Layout.dwg',
    fileExtension: 'dwg',
    fileSizeBytes: 24500000,
    fileSizeFormatted: '24.5 MB',
    category: 'technical',
    kind: 'blueprint',
    uploadedBy: 'استشاري مراكز البيانات Tier III',
    uploadedAt: '2025-11-14',
    uploadedAtArabic: '14 نوفمبر 2025',
    version: 'v2.0',
    description: 'مخطط العزل الحراري لممرات التبريد ومواقع مكيفات In-Row Precision Cooling.',
    status: 'active',
  },
  {
    id: 'doc-10',
    projectId: 'p-3',
    projectName: 'مركز بيانات (تيار خفيف وبارد)',
    title: 'شهادة ضمان مصنعية نظام الـ UPS وبطاريات الليثيوم (5 سنوات)',
    fileName: 'Schneider_Galaxy_UPS_Lithium_Battery_Warranty.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 2100000,
    fileSizeFormatted: '2.1 MB',
    category: 'administrative',
    kind: 'warranty',
    uploadedBy: 'شركة شنايدر الكتريك المعتمدة',
    uploadedAt: '2026-01-30',
    uploadedAtArabic: '30 يناير 2026',
    version: 'v1.0',
    description: 'شهادة ضمان شاملة لاستبدال البطاريات والصيانة الوقائية الدورية بدون رسوم إضافية.',
    status: 'active',
  },
  {
    id: 'doc-11',
    projectId: 'p-3',
    projectName: 'مركز بيانات (تيار خفيف وبارد)',
    title: 'شهادة اعتماد واختبار نظام إطفاء الحرائق الغازي FM-200',
    fileName: 'FM200_Gas_Suppression_NFPA_Compliance_Cert.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 1750000,
    fileSizeFormatted: '1.7 MB',
    category: 'technical',
    kind: 'warranty',
    uploadedBy: 'إدارة الحماية المدنية والسلامة',
    uploadedAt: '2026-03-05',
    uploadedAtArabic: '5 مارس 2026',
    version: 'v1.0',
    description: 'شهادة اختبار الضغط الهيدروستاتيكي وتوزيع نوزلات الغاز النظيف المعتمدة.',
    status: 'active',
  },

  // تطوير نظام التكييف (p-4)
  {
    id: 'doc-12',
    projectId: 'p-4',
    projectName: 'تطوير نظام التكييف',
    title: 'عقد توريد وتركيب محطة الشيلرات ومضخات التبريد',
    fileName: 'HVAC_Central_Chiller_Plant_Turnkey_Contract.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 4400000,
    fileSizeFormatted: '4.4 MB',
    category: 'financial',
    kind: 'contract',
    uploadedBy: 'مدير العقود الهندسية',
    uploadedAt: '2026-02-15',
    uploadedAtArabic: '15 فبراير 2026',
    version: 'v1.1',
    description: 'عقد تسليم مفتاح يشمل 3 وحدات شيلر مبرد بالهواء بسعة 450 طن تبريدي لكل وحدة.',
    status: 'active',
  },
  {
    id: 'doc-13',
    projectId: 'p-4',
    projectName: 'تطوير نظام التكييف',
    title: 'المخطط الهيدروليكي لمسارات شبكة المياه المثلجة وصمامات التحكم',
    fileName: 'Chilled_Water_Hydraulic_Piping_Schematic.dwg',
    fileExtension: 'dwg',
    fileSizeBytes: 15800000,
    fileSizeFormatted: '15.8 MB',
    category: 'technical',
    kind: 'blueprint',
    uploadedBy: 'مهندس الموقع / م. يوسف إبراهيم',
    uploadedAt: '2026-04-02',
    uploadedAtArabic: '2 أبريل 2026',
    version: 'v2.0',
    description: 'مخطط أقطار الأنابيب وصمامات الموازنة ومضخات السحب المتغيرة السرعة VFDs.',
    status: 'active',
  },
  {
    id: 'doc-14',
    projectId: 'p-4',
    projectName: 'تطوير نظام التكييف',
    title: 'شهادة ضمان المصنع لضواغط الشيلر ومحولات التردد (7 سنوات)',
    fileName: 'Carrier_Screw_Compressors_7Years_Warranty.pdf',
    fileExtension: 'pdf',
    fileSizeBytes: 1300000,
    fileSizeFormatted: '1.3 MB',
    category: 'administrative',
    kind: 'warranty',
    uploadedBy: 'وكيل التبريد والتكييف المعتمد',
    uploadedAt: '2026-05-18',
    uploadedAtArabic: '18 مايو 2026',
    version: 'v1.0',
    description: 'شهادة الضمان الذهبي للضواغط الميكانيكية ضد عيوب الصناعة مع التفتيش نصف السنوي.',
    status: 'active',
  },
];

// Document Management Endpoints
app.get('/api/documents', (req: Request, res: Response) => {
  const { projectId, category, kind, query } = req.query;
  let filtered = [...projectDocuments];

  if (projectId && projectId !== 'all') {
    filtered = filtered.filter((d) => d.projectId === projectId);
  }

  if (category && category !== 'all') {
    filtered = filtered.filter((d) => d.category === category);
  }

  if (kind && kind !== 'all') {
    filtered = filtered.filter((d) => d.kind === kind);
  }

  if (query && typeof query === 'string') {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.fileName.toLowerCase().includes(q) ||
        d.projectName.toLowerCase().includes(q) ||
        (d.description && d.description.toLowerCase().includes(q))
    );
  }

  res.json(filtered);
});

app.post('/api/documents', (req: Request, res: Response) => {
  const {
    projectId,
    projectName,
    title,
    fileName,
    fileExtension,
    fileSizeBytes,
    category,
    kind,
    uploadedBy,
    version,
    description,
  } = req.body;

  if (!projectId || !title) {
    return res.status(400).json({ error: 'المشروع وعنوان المستند مطلوبان' });
  }

  const proj = projects.find((p) => p.id === projectId);
  const resolvedProjectName = projectName || (proj ? proj.name : 'مشروع عام');

  const bytes = Number(fileSizeBytes) || 2800000;
  const sizeFormatted =
    bytes >= 1048576
      ? `${(bytes / 1048576).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

  const ext = fileExtension || (fileName ? fileName.split('.').pop()?.toLowerCase() : 'pdf') || 'pdf';

  const newDoc: ProjectDocument = {
    id: `doc-${Date.now()}`,
    projectId,
    projectName: resolvedProjectName,
    title,
    fileName: fileName || `${title.replace(/\s+/g, '_')}.${ext}`,
    fileExtension: ext as any,
    fileSizeBytes: bytes,
    fileSizeFormatted: sizeFormatted,
    category: (category as any) || 'technical',
    kind: (kind as any) || 'blueprint',
    uploadedBy: uploadedBy || 'المدير العام / مدير الشبكة',
    uploadedAt: new Date().toISOString().split('T')[0],
    uploadedAtArabic: '2 نوفمبر 2026',
    version: version || 'v1.0 (جديد)',
    description: description || 'تم حفظ وأرشفة المستند بنجاح ضمن مستندات المشروع.',
    status: 'active',
  };

  projectDocuments.unshift(newDoc);
  res.status(201).json(newDoc);
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLen = projectDocuments.length;
  projectDocuments = projectDocuments.filter((d) => d.id !== id);

  if (projectDocuments.length === initialLen) {
    return res.status(404).json({ error: 'المستند غير موجود' });
  }

  res.json({ success: true, message: 'تم حذف المستند بنجاح من الأرشيف الرقمي' });
});

app.get('/api/projects/:id/documents', (req: Request, res: Response) => {
  const { id } = req.params;
  const docs = projectDocuments.filter((d) => d.projectId === id);
  res.json(docs);
});

// ----------------- Vite Setup in Dev / Static in Prod -----------------
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Arabic Construction & IT Infrastructure Dashboard running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
