import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-proprietaire-dash',
  templateUrl: './proprietaire-dash.component.html',
  styleUrls: ['./proprietaire-dash.component.css'],
})
export class ProprietaireDashComponent {
  isCollapsed = false;
  isSidebarVisible = false;
  isEditMode = false;
  annonceId: number | null = null;

  constructor(private router: Router) {
    // Surveiller les changements de route pour détecter le mode édition
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        this.isEditMode = url.includes('gestion-annonce/');
        
        if (this.isEditMode) {
          const parts = url.split('/');
          this.annonceId = parseInt(parts[parts.length - 1], 10);
        } else {
          this.annonceId = null;
        }
      });
  }

  toggleSidebar(): void {
    if (window.innerWidth < 1200) {
      this.isSidebarVisible = !this.isSidebarVisible;
    } else {
      this.isCollapsed = !this.isCollapsed;
    }
  }
}