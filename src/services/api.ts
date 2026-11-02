import { Alert, DashboardData, Project, Site, SystemService, TaskItem } from '../types/dashboard';

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard');
  if (!res.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  return res.json();
}

export async function fetchProjects(status?: string, search?: string): Promise<Project[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (search) params.append('search', search);
  const res = await fetch(`/api/projects?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return res.json();
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create project');
  }
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error('Failed to update project');
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete project');
  }
}

export async function fetchSites(): Promise<Site[]> {
  const res = await fetch('/api/sites');
  if (!res.ok) {
    throw new Error('Failed to fetch sites');
  }
  return res.json();
}

export async function reconnectSite(id: string): Promise<Site> {
  const res = await fetch(`/api/sites/${id}/reconnect`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to toggle site connection');
  }
  return res.json();
}

export async function fetchServices(): Promise<SystemService[]> {
  const res = await fetch('/api/services');
  if (!res.ok) {
    throw new Error('Failed to fetch services');
  }
  return res.json();
}

export async function toggleServiceStatus(id: string): Promise<SystemService> {
  const res = await fetch(`/api/services/${id}/toggle`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to toggle service status');
  }
  return res.json();
}

export async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch('/api/alerts');
  if (!res.ok) {
    throw new Error('Failed to fetch alerts');
  }
  return res.json();
}

export async function resolveAlert(id: string): Promise<void> {
  const res = await fetch(`/api/alerts/${id}/resolve`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to resolve alert');
  }
}

export async function fetchTasks(): Promise<TaskItem[]> {
  const res = await fetch('/api/tasks');
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
}

export async function toggleTaskCompletion(id: string): Promise<TaskItem> {
  const res = await fetch(`/api/tasks/${id}/toggle`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to toggle task');
  }
  return res.json();
}

export async function updateTaskStatus(id: string, status: 'in_progress' | 'completed' | 'delayed'): Promise<TaskItem> {
  const res = await fetch(`/api/tasks/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error('Failed to update task status');
  }
  return res.json();
}

export async function refreshTelemetry(): Promise<DashboardData['networkTelemetry']> {
  const res = await fetch('/api/telemetry/refresh', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to refresh telemetry');
  }
  return res.json();
}

export async function fetchPerformanceReport(): Promise<import('../types/dashboard').PerformanceReport> {
  const res = await fetch('/api/reports/performance');
  if (!res.ok) {
    throw new Error('Failed to fetch performance report');
  }
  return res.json();
}

export async function fetchBudgetTrends(): Promise<import('../types/dashboard').BudgetTrendData> {
  const res = await fetch('/api/financials/budget-trend');
  if (!res.ok) {
    throw new Error('Failed to fetch budget trend data');
  }
  return res.json();
}

export async function fetchGanttSchedule(): Promise<import('../types/dashboard').GanttScheduleData> {
  const res = await fetch('/api/schedule/gantt');
  if (!res.ok) {
    throw new Error('Failed to fetch Gantt schedule');
  }
  return res.json();
}

export async function updateProjectSchedule(
  id: string,
  startDate?: string,
  endDate?: string
): Promise<{ project: import('../types/dashboard').Project; conflicts: import('../types/dashboard').ScheduleConflict[] }> {
  const res = await fetch(`/api/projects/${id}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!res.ok) {
    throw new Error('Failed to update project schedule');
  }
  return res.json();
}



