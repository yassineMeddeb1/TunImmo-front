import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../models/Utilisateur';

export interface PaginatedUsers {
  content: Utilisateur[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:9091/api/profil';
  private apiUrlUser = 'http://localhost:9091/api/admin/users';

  constructor(private http: HttpClient) {}

  getCurrentUserProfile(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.apiUrl}`,{withCredentials: true });
  }
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, {withCredentials: true });
  }

  getContactsByRecipeId(recipeId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contacts`, {
      params: { recipeId }, withCredentials: true
    });
  }

  updateProfile(userData: Partial<Utilisateur>): Observable<any> {
    return this.http.put(`${this.apiUrl}/modifier`, userData,{withCredentials: true });
  }
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/reset-password`, { token, nouveauMotDePasse: newPassword });
  }
  getUsers(page: number = 0, size: number = 10, sortBy: string = 'nom'): Observable<PaginatedUsers> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy);

    return this.http.get<PaginatedUsers>(this.apiUrlUser, { params });
  }

  searchUsers(query: string, role: string): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${this.apiUrlUser}/search`, {
      params: {
        query: query || '',
        role: role || ''
      }
    });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrlUser}/${id}`);
  }

  toggleUserStatus(id: number): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${this.apiUrlUser}/${id}/status`, {});
  }

  getUserReservations(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlUser}/${id}/reservations`);
  }

  getUserAnnonces(id: number): Observable<any> {
    return this.http.get(`${this.apiUrlUser}/${id}/annonces`);
  }
}