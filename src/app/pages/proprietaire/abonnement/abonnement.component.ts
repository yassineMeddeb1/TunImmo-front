import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbonnementService } from '../../../services/abonnement.service';
import { Abonnement } from '../../../models/abonnements';
@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css']
})
export class AbonnementComponent implements OnInit {
  abonnementActuel: Abonnement | null = null;
  abonnementSelectionne: Abonnement | null = null;
  abonnementsDisponibles: Abonnement[] = [];

  constructor(
    private router: Router,
    private abonnementService: AbonnementService
  ) {}

  ngOnInit(): void {
    this.loadCurrentSubscription();
    this.loadAvailableSubscriptions();
  }

  loadCurrentSubscription(): void {
    this.abonnementService.getCurrentAbonnement().subscribe({
      next: (abonnement) => {
        this.abonnementActuel = abonnement;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'abonnement actuel', err);
      }
    });
  }

  loadAvailableSubscriptions(): void {
    this.abonnementService.getAvailableAbonnements().subscribe({
      next: (abonnements) => {
        this.abonnementsDisponibles = abonnements;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des abonnements disponibles', err);
      }
    });
  }

  choisirAbonnement(abonnement: Abonnement): void {
    if (abonnement.type === this.abonnementActuel?.type) return;
    this.abonnementSelectionne = abonnement;
    this.scrollToResume();
  }

  private scrollToResume(): void {
    const resumeSection = document.querySelector('.resume-section');
    if (resumeSection) {
      resumeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goToPayment(): void {
    if (this.abonnementSelectionne) {
      this.router.navigate(['proprietaire/paiement'], {
        state: { abonnement: this.abonnementSelectionne }
      });
    }
  }

  getIconForAbonnement(type: string): string {
    const icons: Record<string, string> = {
      'GRATUIT': 'bi-gift-fill',
      'STANDARD': 'bi-star-fill',
      'PREMIUM': 'bi-award-fill'
    };
    return icons[type] || 'bi-credit-card';
  }

  getBadgeClass(abonnement: Abonnement): string {
    if (abonnement.type === this.abonnementActuel?.type) {
      return 'badge-active';
    }
    return abonnement.popular ? 'badge-popular' : '';
  }
}