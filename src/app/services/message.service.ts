import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, delay, retryWhen, tap } from 'rxjs/operators';
import { MessageDTO } from '../models/MessageDTO';
import { ContactDTO } from '../models/ContactDTO';

@Injectable({
  providedIn: 'root'
})
export class MessageService implements OnDestroy {
  private apiUrl = 'http://localhost:9091/api/messages';
  private wsUrl = 'ws://localhost:9091/ws/messages';
  private socket$: WebSocketSubject<any> | null = null;
  private messageSubject = new Subject<MessageDTO>();
  private connectionStatus = new BehaviorSubject<boolean>(false);
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000;
  private reconnectTimer: any;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  connectWebSocket(): Observable<MessageDTO> {
    if (this.socket$ && !this.socket$.closed) {
      return this.socket$.asObservable();
    }

    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();

    if (!token || !user) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Nouvelle URL correctement formatée
    const wsUrl = `${this.wsUrl}?token=${token}&userId=${user.id}`;
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      this.socket$ = webSocket({
        url: wsUrl,
        openObserver: {
          next: () => {
            console.log('WebSocket connection established');
            this.connectionStatus.next(true);
            this.resetReconnection();
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket connection closed');
            this.connectionStatus.next(false);
            this.scheduleReconnection();
          }
        },
        serializer: msg => JSON.stringify(msg), // Sérialiseur explicite
        deserializer: msg => {
          try {
            return JSON.parse(msg.data);
          } catch (e) {
            console.error('Error parsing message:', e);
            return { error: 'Invalid message format' };
          }
        }
      });

      return this.socket$.pipe(
        tap({
          next: (msg: MessageDTO) => {
            console.log('Message received:', msg);
            this.messageSubject.next(msg);
          },
          error: err => {
            console.error('WebSocket error:', err);
            this.connectionStatus.next(false);
            this.scheduleReconnection();
          }
        }),
        retryWhen(errors => errors.pipe(
          tap(err => console.log('Retrying WebSocket connection...', err)),
          delay(this.reconnectInterval)
        )
      ));
    } catch (err) {
      console.error('WebSocket initialization error:', err);
      return throwError(() => err);
    }
  }

  private resetReconnection(): void {
    this.reconnectAttempts = 0;
    clearTimeout(this.reconnectTimer);
  }

  private scheduleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.connectWebSocket().subscribe({
        error: err => console.error('Reconnection failed:', err)
      });
    }, this.reconnectInterval);
  }


  getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  getContacts(): Observable<ContactDTO[]> {
    const headers = this.authService.getAuthHeaders(); 
    return this.http.get<ContactDTO[]>(`${this.apiUrl}/contacts`,{ headers, withCredentials: true }).pipe(
      catchError(err => {
        console.error('Error fetching contacts:', err);
        return of([]);
      })
    );
  }

  getConversation(contactId: number, bienId?: number): Observable<MessageDTO[]> {
    const params: any = { contactId };
    if (bienId) params.bienId = bienId;
    
    return this.http.get<MessageDTO[]>(`${this.apiUrl}/conversation`, { params }).pipe(
      catchError(err => {
        console.error('Error fetching conversation:', err);
        return of([]);
      })
    );
  }

  sendMessage(message: MessageDTO): Observable<void> {
    if (!message?.recipientId || !message.content) {
      return throwError(() => new Error('Invalid message format'));
    }

    if (this.socket$ && !this.socket$.closed && this.connectionStatus.value) {
      try {
        const wsMessage = {
          type: 'message',
          recipientId: message.recipientId,
          content: message.content,
          bienId: message.bienId || null
        };
        
        this.socket$.next(wsMessage);
        return of(undefined);
      } catch (err) {
        console.error('WebSocket send error:', err);
        return this.sendViaHttp(message);
      }
    } else {
      console.log('WebSocket not available, falling back to HTTP');
      return this.sendViaHttp(message);
    }
  }

  private sendViaHttp(message: MessageDTO): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/send`, message).pipe(
      catchError(err => {
        console.error('HTTP send error:', err);
        return throwError(() => err);
      })
    );
  }

  markMessagesAsRead(messageIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark-as-read`, { messageIds }).pipe(
      catchError(err => {
        console.error('Error marking messages as read:', err);
        throw err;
      })
    );
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    this.connectionStatus.next(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}