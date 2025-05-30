import { Component, OnInit } from '@angular/core';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { Reservation } from '../../../models/Reservation';
import { ImageService } from '../../../services/image-service.service';
declare var window: any;

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.css'],
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  reservationsFiltrees: Reservation[] = [];
  paginatedReservations: Reservation[] = [];

  // Configuration de la pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  itemsPerPageOptions: number[] = [5, 10, 20, 50];
  searchTerm: string = '';

  filtres = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Confirmées', value: 'CONFIRMEE' },
    { label: 'Refusées', value: 'REFUSEE' },
    { label: 'Annulées', value: 'ANNULEE' },
    { label: 'Terminées', value: 'TERMINEE' },
  ];

  stats = [
    { label: 'Total', value: 0, type: 'all' },
    { label: 'En attente', value: 0, type: 'EN_ATTENTE' },
    { label: 'Confirmées', value: 0, type: 'CONFIRMEE' },
  ];

  filtreActif: string = 'toutes';
  selectedReservationId: number | null = null;
  commentaireRefus: string = '';
  isLoading: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.fetchReservations();
  }

  fetchReservations(): void {
    this.isLoading = true;
    this.reservationService.getReservationsByProprietaire().subscribe({
      next: (res) => {
        this.reservations = res;
        this.updateStatistics();
        this.filtrerReservations();
        this.loadImagesForReservations();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reservations:', err);
        this.isLoading = false;
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

  updateStatistics(): void {
    this.stats[0].value = this.reservations.length;
    this.stats[1].value = this.reservations.filter(r => r.statut === 'EN_ATTENTE').length;
    this.stats[2].value = this.reservations.filter(r => r.statut === 'CONFIRMEE').length;
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
      reservation.client?.nom?.toLowerCase().includes(term) ||
      reservation.client?.prenom?.toLowerCase().includes(term) ||
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

  // Reservation actions
  accepterReservation(id: number): void {
    if (confirm('Voulez-vous vraiment accepter cette réservation ?')) {
      this.reservationService.accepter(id).subscribe({
        next: () => {
          this.fetchReservations();
        },
        error: (err) => {
          console.error('Error accepting reservation:', err);
          alert('Une erreur est survenue lors de l\'acceptation de la réservation');
        }
      });
    }
  }

  ouvrirRefusModal(reservation: Reservation): void {
    this.selectedReservationId = reservation.id ?? null;
    this.commentaireRefus = '';
    const modal = new window.bootstrap.Modal(
      document.getElementById('refusModal')
    );
    modal.show();
  }

  confirmerRefus(): void {
    if (!this.selectedReservationId) return;
    
    if (!this.commentaireRefus.trim()) {
      alert('Veuillez saisir un motif de refus');
      return;
    }

    if (confirm('Voulez-vous vraiment refuser cette réservation ?')) {
      this.reservationService
        .refuser(this.selectedReservationId, this.commentaireRefus)
        .subscribe({
          next: () => {
            this.fetchReservations();
            this.fermerModal();
          },
          error: (err) => {
            console.error('Error rejecting reservation:', err);
            alert('Une erreur est survenue lors du refus de la réservation');
          }
        });
    }
  }

  fermerModal(): void {
    this.selectedReservationId = null;
    this.commentaireRefus = '';
    const modal = document.getElementById('refusModal');
    if (modal) {
      const bootstrapModal = window.bootstrap.Modal.getInstance(modal);
      bootstrapModal?.hide();
    }
  }

  voirDetails(reservation: Reservation): void {
    // Implémentez la navigation vers les détails ou ouvrez un modal
    console.log('Détails de la réservation:', reservation);
    // this.router.navigate(['/reservation', reservation.id]);
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
  
  supprimerReservation(idBien: number | undefined): void {
    if (!idBien) return;
    
    if (confirm('Voulez-vous vraiment supprimer ce bien ? Cette action est irréversible.')) {
      this.reservationService.supprimerReservation(idBien).subscribe({
        next: () => {
          this.fetchReservations();
        },
        error: (err) => {
          console.error('Error deleting property:', err);
          alert('Une erreur est survenue lors de la suppression du bien');
        }
      });
    }
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/default-property.jpg';
  }
}