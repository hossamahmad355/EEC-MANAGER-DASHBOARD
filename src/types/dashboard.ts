export interface Project {
  id: string;
  name: string;
  category: string;
  executionRate: number;
  initialHandoverRate: number;
  finalHandoverRate: number;
  status: 'completed' | 'in_progress' | 'delayed' | 'at_risk';
  budgetEGP: number;
  manager: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface Site {
  id: string;
  name: string;
  isMain: boolean;
  status: 'connected' | 'disconnected' | 'warning';
  internetUsage: number;
  devicesCount: number;
  ip: string;
  location: string;
  lastPing: string;
}

export interface SystemService {
  id: string;
  name: string;
  techLabel: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
  type: 'windows' | 'files' | 'database' | 'portal' | 'auth' | 'dhcp' | 'dns';
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  location?: string;
  timestamp: string;
  resolved: boolean;
}

export interface TaskItem {
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

export interface DashboardData {
  kpis: {
    remainingBudget: number;
    remainingBudgetPercentage: number;
    actualCost: number;
    actualCostPercentage: number;
    totalContracts: number;
    overallCompletionRate: number;
    completionRateTrend: string;
    totalProjects: number;
    totalSites: number;
    totalEmployees: number;
  };
  projectDistribution: {
    total: number;
    completed: { count: number; percentage: string };
    inProgress: { count: number; percentage: string };
    delayed: { count: number; percentage: string };
    atRisk: { count: number; percentage: string };
  };
  networkTelemetry: {
    accessPoints: { total: number; active: number };
    switches: { total: number; active: number };
    routers: { total: number; active: number };
    firewall: { status: string; name: string };
    internet: { status: string; name: string };
    currentAverageUsage: number;
    trafficHistory: { time: string; usage: number }[];
  };
  services: SystemService[];
  alerts: Alert[];
  tasksCounters: {
    pendingApprovals: number;
    openTickets: number;
    maintenanceTasks: number;
    systemUpdates: number;
  };
  topProjects: Project[];
  topSites: Site[];
}

export interface PerformanceReport {
  reportTitle: string;
  companyName: string;
  generatedAt: string;
  generatedAtArabic: string;
  generatedBy: string;
  summary: {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    delayedProjects: number;
    atRiskProjects: number;
    overallCompletionRate: number;
    totalContractsBudget: number;
    actualCostSpent: number;
    remainingBudget: number;
    connectedSitesCount: number;
    totalSitesCount: number;
    activeAlertsCount: number;
  };
  projects: Array<
    Project & {
      statusArabic: string;
    }
  >;
}

export interface MonthlyTrend {
  month: string;
  shortMonth: string;
  remainingBudget: number; // in Millions
  actualExpenses: number; // in Millions
  remainingBudgetEGP: number;
  actualExpensesEGP: number;
  totalBudget: number;
  burnRate: string;
}

export interface BudgetTrendData {
  title: string;
  currency: string;
  currentRemaining: number;
  currentActual: number;
  totalContracts: number;
  trends: MonthlyTrend[];
}

export interface ScheduleConflict {
  id: string;
  type: 'direct_handover_overlap' | 'delayed_risk';
  severity: 'high' | 'medium';
  projectIds: string[];
  projectNames: string[];
  title: string;
  description: string;
  handoverDates: string[];
  suggestedAction: string;
}

export interface GanttScheduleData {
  projects: Project[];
  conflicts: ScheduleConflict[];
  timelineStart: string;
  timelineEnd: string;
  currentDate: string;
}


