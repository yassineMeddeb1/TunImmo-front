import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private jwtHelper = new JwtHelperService();

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token && !this.jwtHelper.isTokenExpired(token)) {
      // Si le token existe et n'est pas expiré, l'ajouter à la requête
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(request); // Continuer avec la requête avec le token valide
    }

    // Si le token est expiré, tenter de le rafraîchir
    if (token && this.jwtHelper.isTokenExpired(token)) {
      return this.authService.refreshToken().pipe(
        switchMap((newToken: any) => {
          // Si un nouveau token est récupéré, l'ajouter à la requête
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next.handle(request); // Refaire la requête avec le nouveau token
        }),
        catchError((error) => {
          this.router.navigate(['/login']); // Si l'actualisation du token échoue, rediriger vers /login
          return throwError(error);
        })
      );
    }

    return next.handle(request); // Si le token n'existe pas ou est invalide, continuer sans l'ajouter
  }
}
