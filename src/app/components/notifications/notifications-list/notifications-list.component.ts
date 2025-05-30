import { Component, EventEmitter, OnInit, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NotificationDTO, NotificationPage, NotificationType } from '../../../models/NotificationDTO';
import { NotificationService } from '../../../services/notifications.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html',
  styleUrls: ['./notifications-list.component.css']
})
export class NotificationsListComponent implements OnInit {
  @ViewChild('notificationContainer') notificationContainer!: ElementRef;
  @Output() notificationClicked = new EventEmitter<NotificationDTO>();
  
  notifications: NotificationDTO[] = [];
  page = 0;
  size = 10;
  hasMore = true;
  loading = false;
  error = false;
  totalCount = 0;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadInitialNotifications();
  }

  loadInitialNotifications(): void {
    this.loading = true;
    this.error = false;
    this.notificationService.getPaginatedNotifications(0, this.size)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: NotificationPage) => {
          this.notifications = response.content;
          this.totalCount = response.totalElements;
          this.hasMore = !response.last;
          this.page = 1;
        },
        error: () => this.error = true
      });
  }

  loadMore(): void {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.error = false;
    this.notificationService.getPaginatedNotifications(this.page, this.size)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: NotificationPage) => {
          this.notifications = [...this.notifications, ...response.content];
          this.hasMore = !response.last;
          this.page++;
        },
        error: () => this.error = true
      });
  }

  retryLoading(): void {
    this.error = false;
    this.loadInitialNotifications();
  }

  handleNotificationClick(notification: NotificationDTO): void {
    if (!notification.lu) {
      this.markAsRead(notification.id);
    }
    this.notificationClicked.emit(notification);
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.lu = true;
      }
    });
  }

  markAllAsRead(): void {
    const unreadIds = this.notifications
      .filter(n => !n.lu)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      this.notificationService.markAllAsRead(unreadIds).subscribe(() => {
        this.notifications.forEach(n => n.lu = true);
      });
    }
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  get groupedNotifications(): { date: string, notifications: NotificationDTO[] }[] {
    const groups: { [key: string]: NotificationDTO[] } = {};
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    this.notifications.forEach(notification => {
      const notificationDate = new Date(notification.dateEnvoi).toDateString();
      let groupKey = new Date(notification.dateEnvoi).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      
      if (notificationDate === today) {
        groupKey = "Aujourd'hui";
      } else if (notificationDate === yesterdayStr) {
        groupKey = 'Hier';
      }
      
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(notification);
    });
    
    return Object.keys(groups).map(date => ({
      date,
      notifications: groups[date].sort((a, b) =>
        new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime()
      )
    }));
  }

  isNew(notification: NotificationDTO): boolean {
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
    return new Date(notification.dateEnvoi) > fiveMinutesAgo;
  }

  getNotificationIcon(type: NotificationType): string {
    const icons = {
      [NotificationType.NOUVELLE_RESERVATION]: 'bi-calendar-plus',
      [NotificationType.RESERVATION_CONFIRMEE]: 'bi-check-circle',
      [NotificationType.RESERVATION_ANNULEE]: 'bi-x-circle',
      [NotificationType.PAIEMENT_EFFECTUE]: 'bi-credit-card',
      [NotificationType.AVIS_RECU]: 'bi-star',
      [NotificationType.MESSAGE_NON_LU]: 'bi-chat-left',
      [NotificationType.NOUVELLE_ANNONCE]: 'bi-house-add'
    };
    return `bi ${icons[type] || 'bi-bell'}`;
  }

  getNotificationColor(type: NotificationType): string {
    const colors = {
      [NotificationType.NOUVELLE_RESERVATION]: '#4e73df',
      [NotificationType.RESERVATION_CONFIRMEE]: '#1cc88a',
      [NotificationType.RESERVATION_ANNULEE]: '#e74a3b',
      [NotificationType.PAIEMENT_EFFECTUE]: '#36b9cc',
      [NotificationType.AVIS_RECU]: '#f6c23e',
      [NotificationType.MESSAGE_NON_LU]: '#858796',
      [NotificationType.NOUVELLE_ANNONCE]: '#6f42c1'
    };
    return colors[type] || '#d1d3e2';
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 50) {
      this.loadMore();
    }
  }
}