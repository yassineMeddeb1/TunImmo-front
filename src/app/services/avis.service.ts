import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Avis } from '../models/Avis';
import { AvisRequestDTO } from '../models/AvisRequestDTO';

@Injectable({
  providedIn: 'root'
})
export class AvisService {
  private apiUrl = "http://localhost:9091/api/avis";

  constructor(private http: HttpClient) {}

  getAvisByBienId(bienId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/bien/${bienId}`, { withCredentials: true });
  }

  createAvis(avisRequest: AvisRequestDTO): Observable<Avis> {
    return this.http.post<Avis>(this.apiUrl, avisRequest, { withCredentials: true });
  }

  getAverageRating(bienId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/bien/${bienId}/moyenne`, { withCredentials: true });
  }

  deleteAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}