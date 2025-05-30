import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap, of } from 'rxjs';  // Ajout de 'of'
import { Utilisateur } from '../models/Utilisateur';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:9091/api/auth';

  constructor(private http: HttpClient) {}

  register(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  verifyCode(email: string, code: string): Observable<string> {
    const params = new HttpParams()
      .set('email', email)
      .set('code', code);

    return this.http.post<string>(`${this.apiUrl}/verify-code`, params, { responseType: 'text' as 'json' });
  }

  getToken(): string | null {
    return this.getCookie('token');  // Récupérer le token depuis le cookie
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // Fonction pour récupérer un cookie par son nom
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  getRoles(): string[] {
    const token = this.getToken();
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      if (Array.isArray(payload.roles)) {
        // Cas 1 : ["PROPRIETAIRE", "VISITEUR"]
        if (typeof payload.roles[0] === 'string') {
          return payload.roles;
        }
        // Cas 2 : [{ roleType: "PROPRIETAIRE" }]
        return payload.roles.map((r: any) => r.roleType);
      }
    }
    return [];
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getCookie('refresh_token'); // Récupérer le refresh_token du cookie
    
    return this.http.post(`${this.apiUrl}/refresh-token`, { refreshToken })
      .pipe(
        switchMap((response: any) => {
          // Supposons que la réponse contient un nouveau access_token
          this.setSecureCookie('token', response.token); // Stocker le nouveau token
          return of(response.token); // Retourner le nouveau token
        })
      );
  }

  // Fonction pour définir un cookie HTTP-only sécurisé
  setSecureCookie(name: string, value: string): void {
    const date = new Date();
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000); // Cookie expire dans 1 jour
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; secure; HttpOnly`;
  }

  getProtectedData(): Observable<any> {
    return this.http.get('http://localhost:8080/api/protected', {
      headers: this.getAuthHeaders(),
    });
  }
  getCurrentUser(): Utilisateur | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
  
        // Adaptation selon la structure de ton JWT
        const user: Utilisateur = {
          id: payload.id,
          nom: payload.nom,
          prenom: payload.prenom,
          email: payload.sub,  // souvent dans le champ 'sub'
          roles: this.getRoles(),
          // ajoute d'autres champs si nécessaires
        };
        return user;
      } catch (error) {
        console.error('Erreur de décodage du token', error);
      }
    }
    return null;
  }
  forgotPassword(email: string) {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }
  
  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      token,
      newPassword,
    });
  }
  private deleteCookie(name: string): void {
    document.cookie = `${name}=; Max-Age=0; path=/; secure`;
  }
  logoutFromServer(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        // Suppression locale si tu stockes des tokens aussi en local
        this.deleteCookie('token');
        this.deleteCookie('refresh_token');
        window.location.href = '/login';
      },
      error: (err) => {
        console.error('Erreur lors de la déconnexion :', err);
      }
    });
  }
  
}
