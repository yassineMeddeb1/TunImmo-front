

  import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, merge, of } from 'rxjs';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { NotificationDTO, NotificationPage } from '../models/NotificationDTO';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private socket: WebSocket | null = null;
  private notificationSubject = new Subject<NotificationDTO>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private readonly WS_URL = 'ws://localhost:9091/ws/notifications';
  private readonly API_URL = 'http://localhost:9091/api/notifications';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;
  private reconnectTimer: any;

  constructor(private authService: AuthService, private http: HttpClient) {}

  connect(): void {
    if (this.socket) return;

    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();

    if (!token || !user) {
        console.warn('User not authenticated');
        return;
    }

    const wsUrl = `${this.WS_URL}?token=${encodeURIComponent(token)}&userId=${user.id}`;
    console.log('Connecting to WebSocket:', wsUrl); // Ajouté
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
        console.log('WebSocket connection opened'); // Ajouté
        this.reconnectAttempts = 0;
        this.connectionStatus.next(true);
    };

    this.socket.onmessage = (event) => {
        console.log('Raw WebSocket message:', event.data); // Ajouté
        try {
            const notification: NotificationDTO = JSON.parse(event.data);
            console.log('Notification received:', notification);
            this.notificationSubject.next(notification);
        } catch (error) {
            console.error('Error parsing notification:', error, event.data);
        }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.handleReconnection();
    };

    this.socket.onclose = () => {
      this.connectionStatus.next(false);
      console.log('WebSocket connection closed');
      this.handleReconnection();
    };
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  getNotifications(): Observable<NotificationDTO[]> {
    return merge(
      this.getUnreadNotifications(),
      this.notificationSubject.pipe(
        map(notification => [notification])
      )
    ).pipe(
      switchMap(notifications => {
        return this.getUnreadNotifications().pipe(
          map(storedNotifications => {
            // Fusionner et dédupliquer les notifications
            const allNotifications = [...notifications, ...storedNotifications];
            return this.deduplicateNotifications(allNotifications);
          })
        );
      }),
      catchError(error => {
        console.error('Error loading notifications:', error);
        return of([]);
      })
    );
  }

  private deduplicateNotifications(notifications: NotificationDTO[]): NotificationDTO[] {
    const uniqueMap = new Map<number, NotificationDTO>();
    notifications.forEach(notification => {
      if (!uniqueMap.has(notification.id)) {
        uniqueMap.set(notification.id, notification);
      }
    });
    return Array.from(uniqueMap.values())
      .sort((a, b) => new Date(b.dateEnvoi).getTime() - new Date(a.dateEnvoi).getTime());
  }


  sendMessage(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('Impossible d\'envoyer - WebSocket non connecté');
    }
  }

  

  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }


  getPaginatedNotifications(page: number, size: number = 10): Observable<NotificationPage> {
    return this.http.get<NotificationPage>(`${this.API_URL}/paginated?page=${page}&size=${size}`);
  }

  getConnectionStatus$(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  getUnreadNotifications(): Observable<NotificationDTO[]> {
    return this.http.get<NotificationDTO[]>(this.API_URL);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${id}/read`, {});
  }

  markAllAsRead(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/mark-all-read`, ids );
  }
}
