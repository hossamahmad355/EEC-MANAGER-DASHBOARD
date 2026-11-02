/**
 * Browser Desktop Notifications Service using the Web Notification API
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

class DesktopNotificationService {
  private hasSupport: boolean = false;

  constructor() {
    this.hasSupport = typeof window !== 'undefined' && 'Notification' in window;
  }

  public isSupported(): boolean {
    return this.hasSupport;
  }

  public getPermission(): NotificationPermissionState {
    if (!this.hasSupport) return 'unsupported';
    try {
      return Notification.permission as NotificationPermissionState;
    } catch {
      return 'unsupported';
    }
  }

  public async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.hasSupport) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission as NotificationPermissionState;
    } catch (err) {
      console.warn('Could not request notification permission:', err);
      return this.getPermission();
    }
  }

  public sendNotification(
    title: string,
    options?: {
      body?: string;
      icon?: string;
      tag?: string;
      badge?: string;
      data?: any;
    }
  ): boolean {
    if (!this.hasSupport) return false;

    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: options?.body,
          icon: options?.icon || '/assets/aistudio/Arabic_Construction_Management_Dashboard_794fe15b.png',
          tag: options?.tag,
          dir: 'rtl',
          lang: 'ar',
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return true;
      }
    } catch (err) {
      console.warn('Failed to dispatch desktop notification:', err);
    }

    return false;
  }

  // Specific triggers for Construction & IT Infrastructure
  public notifyInfrastructureChange(
    entityName: string,
    status: 'connected' | 'disconnected' | 'warning' | 'degraded',
    details?: string
  ) {
    const isCritical = status === 'disconnected' || status === 'degraded';
    const title = isCritical
      ? `🚨 إنذار شبكي حرج: انقطاع في ${entityName}`
      : `✅ استعادة الاتصال بالبنية التحتية: ${entityName}`;

    const body = details || (isCritical
      ? `تم رصد فشل في الاتصال بالشبكة للموقع (${entityName}). يرجى الفحص الفوري.`
      : `عادت حركة البيانات للعمل بصورة طبيعية في (${entityName}).`);

    this.sendNotification(title, {
      body,
      tag: `infra-${entityName}`,
    });
  }

  public notifyHighPriorityTask(taskTitle: string, assignee: string, location?: string) {
    const title = `⚠️ مهمة عاجلة جديدة: ${taskTitle}`;
    const body = `تم إسناد مهمة ذات أولوية قصوى للمسؤول (${assignee})${location ? ` في ${location}` : ''}.`;

    this.sendNotification(title, {
      body,
      tag: `task-${Date.now()}`,
    });
  }

  public notifyCriticalAlert(alertMessage: string, type: 'danger' | 'warning' | 'info') {
    const iconPrefix = type === 'danger' ? '🔴 إنذار طارئ' : type === 'warning' ? '🟠 تنبيه تحذيري' : '🔵 إشعار نظام';
    this.sendNotification(`${iconPrefix}: مراقبة البنية والمواقع`, {
      body: alertMessage,
      tag: `alert-${Date.now()}`,
    });
  }
}

export const notificationService = new DesktopNotificationService();
