// gestion-annonces.component.ts
import { Component, OnInit } from '@angular/core';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { BienImmobilier } from '../../../models/BienImmobilier';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { ImageService } from '../../../services/image-service.service';
declare var window: any;

@Component({
  selector: 'app-gestion-annonces',
  templateUrl: './gestion-annonces.component.html',
  styleUrls: ['./gestion-annonces.component.css']
})
export class GestionAnnoncesComponent implements OnInit {
  annonces: BienImmobilier[] = [];
  isLoading: boolean = false;
  
  // Filtres
  filtreStatut: string = 'Tous';
  filtreCategorie: string = 'Tous';
  filtreTitre: string = '';
  
  // Pagination
  totalElements: number = 0;
  pageSize: number = 9;
  currentPage: number = 0;
  totalPages: number = 0;

  constructor(
    private annonceService: AnnonceService,
    private toastr: ToastrService,
    private router: Router,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.chargerAnnonces();
  }

  chargerAnnonces(): void {
    this.isLoading = true;
    
    const statut = this.filtreStatut === 'Tous' ? null : 
                   this.filtreStatut === 'Approuvé' ? 1 : 
                   this.filtreStatut === 'Refusé' ? -1 : 0;
    
    this.annonceService.getAnnoncesAdmin(
      statut,
      this.filtreCategorie === 'Tous' ? null : this.filtreCategorie,
      this.filtreTitre,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: any) => {
        this.annonces = response.content;
        console.log(this.annonces)
        this.totalElements = response.totalElements;
        this.totalPages = Math.ceil(response.totalElements / this.pageSize);
        this.annonces.forEach(bien => {
          if (bien.id) {
            this.imageService.loadImages(bien.id).subscribe(images => {
              bien.images = images;
              bien.imageUrls = images.map(img => this.imageService.getImageUrl(img.idImage!));
            });
        }});
       
      },
      error: (err) => {
        console.error('Erreur lors du chargement des annonces:', err);
        this.toastr.error('Une erreur est survenue lors du chargement des annonces', 'Erreur');
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  // Méthodes de filtrage
  appliquerFiltre(): void {
    this.currentPage = 0;
    this.chargerAnnonces();
  }

  reinitialiserFiltres(): void {
    this.filtreStatut = 'Tous';
    this.filtreCategorie = 'Tous';
    this.filtreTitre = '';
    this.appliquerFiltre();
  }

  // Méthodes de pagination
  allerPagePrecedente(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.chargerAnnonces();
    }
  }
  
  allerPageSuivante(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.chargerAnnonces();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.chargerAnnonces();
    }
  }

  getPagesToShow(): number[] {
    const pagesToShow = 5;
    const startPage = Math.max(0, Math.min(
      this.currentPage - Math.floor(pagesToShow / 2),
      this.totalPages - pagesToShow
    ));
    
    return Array.from({ length: Math.min(pagesToShow, this.totalPages) }, (_, i) => startPage + i + 1);
  }

  // Méthodes pour les statistiques
  countByStatus(status: string): number {
    // Implémentation réelle nécessite des données supplémentaires du backend
    // Pour l'exemple, nous retournons une valeur aléatoire
    return Math.floor(Math.random() * 50) + 5;
  }

  // Gestion des statuts
  modifierStatut(id: number, statut: string): void {
    this.isLoading = true;
    
    let statutNum = 0; // En attente
    if (statut === 'Approuvé') statutNum = 1;
    else if (statut === 'Refusé') statutNum = -1;
  
    this.annonceService.updateStatutAdmin(id, statutNum).subscribe({
      next: () => {
        this.toastr.success(`L'annonce a été ${statut.toLowerCase()} avec succès`, 'Succès');
        this.chargerAnnonces();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut:', err);
        this.toastr.error('Échec de la mise à jour du statut', 'Erreur');
        this.isLoading = false;
      }
    });
  }
  
  // Navigation
  voirDetails(id: number): void {
    this.router.navigate(['/details-bien', id]);
  }

  // Utilitaires d'affichage
  getBadgeColor(statut: string): string {
    return statut === 'Approuvé' ? 'success' : 
           statut === 'Refusé' ? 'danger' : 'warning';
  }

  getStatusIcon(statut: string): string {
    return statut === 'Approuvé' ? 'bi-check-circle-fill' : 
           statut === 'Refusé' ? 'bi-x-circle-fill' : 'bi-hourglass-split';
  }
  // Méthode pour confirmer la suppression

annonceASupprimer: {id?: number, titre?: string} = {};

confirmerSuppression(id: number, titre: string): void {
  this.annonceASupprimer = {id, titre};
  // Utilisez ViewChild ou autre méthode pour ouvrir la modal
  const modal = new window.bootstrap.Modal(document.getElementById('confirmationModal'));
  modal.show();
}

supprimerAnnonceConfirmee(): void {
  if (this.annonceASupprimer.id) {
    this.supprimerAnnonce(this.annonceASupprimer.id);
  }
}
// Méthode pour effectuer la suppression
supprimerAnnonce(id: number): void {
  this.isLoading = true;
  
  this.annonceService.supprimerAnnonce(id).subscribe({
    next: () => {
      this.toastr.success('Annonce supprimée avec succès', 'Succès');
      this.chargerAnnonces(); // Recharger la liste
      this.fermerModal();
    },
    error: (err) => {
      console.error('Erreur lors de la suppression:', err);
      this.toastr.error('Échec de la suppression de l\'annonce', 'Erreur');
      this.isLoading = false;
    }
  });
}
fermerModal(): void {
  const modalElement = document.getElementById('confirmationModal');
  if (modalElement) {
    const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }}
}