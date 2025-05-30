import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Assure-toi du bon chemin

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const roles = this.authService.getRoles(); // Récupère les rôles depuis le token JWT
    const expectedRole = next.data['role'];     // Rôle attendu dans la config de route

    if (!roles || !roles.includes(expectedRole)) {
      this.router.navigate(['/forbidden']);
      return false;
    }
    

    return true;
  }
}
