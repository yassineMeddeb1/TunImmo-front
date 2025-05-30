import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Abonnement } from '../models/abonnements';
import { environment } from '../../environements/environment';

@Injectable({
  providedIn: 'root'
})
export class AbonnementService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getCurrentAbonnement(): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${this.apiUrl}/abonnements/current`, {
      headers: this.getAuthHeaders()
    });
  }

  getAvailableAbonnements(): Observable<Abonnement[]> {
    return this.http.get<Abonnement[]>(`${this.apiUrl}/abonnements/available`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.getCurrentUser();
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-User-Id': currentUser?.id?.toString() || ''
    });
  }
}