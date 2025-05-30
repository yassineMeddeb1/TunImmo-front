import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Reservation } from '../models/Reservation';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private baseUrl = 'http://localhost:9091/api/reservations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  creerReservation(reservation: Reservation): Observable<Reservation> {
  const bienId = reservation.biens?.id;
  if (!bienId) {
    throw new Error("bienId est requis pour créer une réservation");
  }

  const headers = this.authService.getAuthHeaders();
  return this.http.post<Reservation>(`${this.baseUrl}/${bienId}`, reservation, { headers, withCredentials: true });
}
  getReservationClient(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/user/reservation`, { withCredentials: true });
  }
  annulerReservation(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/user/annuler/${id}`, null, { withCredentials: true });
  }
  supprimerReservation(idBien: number): Observable<any> {
    const headers = this.authService.getAuthHeaders(); 
    return this.http.delete(`${this.baseUrl}/proprietaire/${idBien}`,{ headers, withCredentials: true });
  }
  
  
  getReservationsByProprietaire(): Observable<Reservation[]> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<Reservation[]>(`${this.baseUrl}/proprietaire`,{ headers, withCredentials: true });
  }
  getIndisponibilites(bienId: number): Observable<{ dateDebut: string, dateFin: string }[]> {
    return this.http.get<{ dateDebut: string, dateFin: string }[]>(`${this.baseUrl}/bien/${bienId}/indisponibilites`, { withCredentials: true });
  }
  

  accepter(reservationId: number): Observable<Reservation> { 
   
    return this.http.post<Reservation>(`${this.baseUrl}/proprietaire/${reservationId}/confirmer`, {},{withCredentials: true });
  }
  

  refuser(reservationId: number, commentaire: string): Observable<void> {
    
    return this.http.post<void>(`${this.baseUrl}/proprietaire/${reservationId}/refuser`, { commentaire} ,{withCredentials: true});
  }
}
