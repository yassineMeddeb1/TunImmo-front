import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { BienImmobilier } from '../../../models/BienImmobilier';
import { ImageService } from '../../../services/image-service.service';
declare var window: any;

@Component({
  selector: 'app-liste-annonces',
  templateUrl: './liste-annonces.component.html',
  styleUrls: ['./liste-annonces.component.css']
})
export class ListeAnnoncesComponent implements OnInit {
  annonces: BienImmobilier[] = [];
  annoncesFiltrees: BienImmobilier[] = [];
  paginatedAnnonces: BienImmobilier[] = [];
  selectedAnnonce: BienImmobilier | null = null;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  itemsPerPageOptions: number[] = [5, 10, 20];
  searchTerm: string = '';

  filtres = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'Disponibles', value: 'disponible' },
    { label: 'Non disponibles', value: 'non-disponible' },
    { label: 'À louer', value: 'LOCATION' },
    { label: 'À vendre', value: 'VENTE' }
  ];

  filtreActif: string = 'toutes';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private annonceService: AnnonceService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadAnnonces();
  }

  loadAnnonces(): void {
    this.isLoading = true;
    this.annonceService.getAnnonceByPropietaire().subscribe({
      next: (data) => {
        this.annonces = data;
        this.annonces.forEach(bien => {
          if (bien.id) {
            this.imageService.loadImages(bien.id).subscribe(images => {
              bien.images = images;
              bien.imageUrls = images.map(img => this.imageService.getImageUrl(img.idImage!));
              this.updatePaginatedAnnonces();
            });
          }
        });
        this.filtrerAnnonces();
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error('Erreur lors du chargement des annonces', 'Erreur');
        console.error(error);
        this.isLoading = false;
      }
    });
  }

  // Filtrage et recherche
  changerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.currentPage = 1;
    this.filtrerAnnonces();
  }

  filtrerAnnonces(): void {
    this.annoncesFiltrees = this.annonces.filter(annonce => {
      // Filtre par statut
      let matchesFilter = true;
      if (this.filtreActif === 'disponible') {
        matchesFilter = annonce.disponible === true;
      } else if (this.filtreActif === 'non-disponible') {
        matchesFilter = annonce.disponible === false;
      } else if (this.filtreActif !== 'toutes') {
        matchesFilter = annonce.typeTransaction === this.filtreActif;
      }

      // Filtre par recherche
      const matchesSearch = !this.searchTerm || this.matchesSearchTerm(annonce);

      return matchesFilter && matchesSearch;
    });

    this.updatePaginatedAnnonces();
  }

  matchesSearchTerm(annonce: BienImmobilier): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      annonce.titre?.toLowerCase().includes(term) ||
      annonce.description?.toLowerCase().includes(term) ||
      annonce.adresse?.toLowerCase().includes(term) ||
      annonce.prix?.toString().includes(term)
    );
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtrerAnnonces();
  }

  getAnnonceCount(filter: string): number {
    if (filter === 'toutes') return this.annonces.length;
    if (filter === 'disponible') return this.annonces.filter(a => a.disponible).length;
    if (filter === 'non-disponible') return this.annonces.filter(a => !a.disponible).length;
    return this.annonces.filter(a => a.typeTransaction === filter).length;
  }

  // Pagination
  updatePaginatedAnnonces(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAnnonces = this.annoncesFiltrees.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.annoncesFiltrees.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedAnnonces();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.updatePaginatedAnnonces();
  }

  getPages(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.annoncesFiltrees.length);
  }

  // Actions
  modifierAnnonce(id: number): void {
    this.router.navigate(['/proprietaire/gestion-annonce', id]);
  }

  ouvrirSuppressionModal(annonce: BienImmobilier): void {
    this.selectedAnnonce = annonce;
    const modal = new window.bootstrap.Modal(
      document.getElementById('suppressionModal')
    );
    modal.show();
  }

  supprimerAnnonce(): void {
    if (!this.selectedAnnonce?.id) return;
    
    this.annonceService.supprimerAnnonce(this.selectedAnnonce.id).subscribe({
      next: () => {
        this.annonces = this.annonces.filter(a => a.id !== this.selectedAnnonce?.id);
        this.filtrerAnnonces();
        this.toastr.success('Annonce supprimée avec succès', 'Succès');
        this.fermerModal();
      },
      error: (err) => {
        console.error('Error deleting announcement:', err);
        this.toastr.error('Erreur lors de la suppression de l\'annonce', 'Erreur');
      }
    });
  }

  fermerModal(): void {
    this.selectedAnnonce = null;
    const modal = document.getElementById('suppressionModal');
    if (modal) {
      const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide();
    }
  }

  voirDetails(id: number): void {
    this.router.navigate(['/details-annonce', id]);
  }

  publierAnnonce(): void {
    this.router.navigate(['/publier-annonce']);
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-property.jpg';
  }
}