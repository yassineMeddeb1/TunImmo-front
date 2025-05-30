import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Reservation } from '../../../models/Reservation';
import { ReservationService } from '../../../services/reservation.service';
import { ImageService } from '../../../services/image-service.service';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ListeReservationComponent implements OnInit {
  reservations: Reservation[] = [];
  reservationsFiltrees: Reservation[] = [];
  paginatedReservations: Reservation[] = [];
  
  // Configuration de la pagination
  currentPage: number = 1;
  itemsPerPage: number = 9;
  searchTerm: string = '';

  filtres = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Confirmées', value: 'CONFIRMEE' },
    { label: 'Refusées', value: 'REFUSEE' },
    { label: 'Annulées', value: 'ANNULEE' },
    { label: 'Terminées', value: 'TERMINEE' },
  ];

  filtreActif: string = 'toutes';

  constructor(
    private reservationService: ReservationService,
    private router: Router,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.chargerReservations();
  }

  chargerReservations(): void {
    this.reservationService.getReservationClient().subscribe({
      next: (data) => {
        this.reservations = data;
        this.filtrerReservations();
        this.loadImagesForReservations();
      },
      error: (err) => console.error('Erreur de chargement des réservations :', err),
      complete: () => {
        console.log(this.reservations);
      }
    });
    
  }
loadImagesForReservations(): void {
    this.reservations.forEach(res => {
      if (res.bien?.id) {
        this.imageService.loadImages(res.bien.id).subscribe(images => {
          if (res.bien) {
            res.bien.imageUrls = images.map(img => 
              this.imageService.getImageUrl(img.idImage!)
            );
          }
          this.updatePaginatedReservations();
        });
      }
    });
  }
  changerFiltre(filtre: string): void {
    this.filtreActif = filtre;
    this.currentPage = 1;
    this.filtrerReservations();
  }

  filtrerReservations(): void {
    if (this.filtreActif === 'toutes') {
      this.reservationsFiltrees = [...this.reservations];
    } else {
      this.reservationsFiltrees = this.reservations.filter(
        r => r.statut === this.filtreActif
      );
    }
    
    if (this.searchTerm) {
      this.reservationsFiltrees = this.reservationsFiltrees.filter(res => 
        this.matchesSearchTerm(res)
      );
    }
    
    this.updatePaginatedReservations();
  }

  matchesSearchTerm(reservation: Reservation): boolean {
    const term = this.searchTerm.toLowerCase();
    return (
      reservation.bien?.titre?.toLowerCase().includes(term) ||
      reservation.bien?.adresse?.toLowerCase().includes(term) ||
      reservation.id?.toString().includes(term)
    ) ?? false;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.filtrerReservations();
  }

  // Pagination methods
  updatePaginatedReservations(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedReservations = this.reservationsFiltrees.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.reservationsFiltrees.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedReservations();
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
    this.updatePaginatedReservations();
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
    return Math.min(this.currentPage * this.itemsPerPage, this.reservationsFiltrees.length);
  }

  getReservationCount(status: string): number {
    if (status === 'toutes') return this.reservations.length;
    return this.reservations.filter(r => r.statut === status).length;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'en-attente';
      case 'CONFIRMEE': return 'confirmee';
      case 'REFUSEE': return 'refusee';
      case 'ANNULEE': return 'annulee';
      case 'TERMINEE': return 'terminee';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'CONFIRMEE': return 'Confirmée';
      case 'REFUSEE': return 'Refusée';
      case 'ANNULEE': return 'Annulée';
      case 'TERMINEE': return 'Terminée';
      default: return status;
    }
  }

  getStatusIcon(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bi bi-hourglass-split';
      case 'CONFIRMEE': return 'bi bi-check-circle';
      case 'REFUSEE': return 'bi bi-x-circle';
      case 'ANNULEE': return 'bi bi-slash-circle';
      default: return 'bi bi-question-circle';
    }
  }

  voirDetails(id: number): void {
    this.router.navigate(['/reservation', id]);
  }

  annuler(id: number): void {
    if (confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      this.reservationService.annulerReservation(id).subscribe({
        next: () => {
          this.reservations = this.reservations.filter(r => r.id !== id);
          this.filtrerReservations();
        },
        error: (err) => console.error('Erreur lors de l\'annulation :', err)
      });
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-property.jpg';
  }
}