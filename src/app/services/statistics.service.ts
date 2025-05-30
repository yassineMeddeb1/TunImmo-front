import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environements/environment';


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getOwnerDashboardData(ownerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/owner/${ownerId}`);
  }
}