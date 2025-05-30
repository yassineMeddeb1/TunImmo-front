import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BienSimple } from '../../../models/bienSimple';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { ReservationService } from '../../../services/reservation.service';
import { ToastrService } from 'ngx-toastr';
import { Reservation } from '../../../models/Reservation';
import { IDate, IDayCalendarConfig } from 'ng2-date-picker';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {
  bien: BienSimple = {
    id: 0,
    titre: '',
    description: '',
    typeLocation: '',
    adresse: '',
    prix: 0
  };

  isLoading: boolean = true;
  @Input() bienId!: number;
  dateConflict: boolean = false;
  dateDebut: any;
  dateFin: any;
  indisponibilites: { dateDebut: string, dateFin: string }[] = [];

  datePickerConfig: Partial<IDayCalendarConfig> = {
    format: 'YYYY-MM-DD',
    showNearMonthDays: true,
    showWeekNumbers: false,
    min: new Date().toISOString().split('T')[0],
    firstDayOfWeek: 'mo'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private annonceService: AnnonceService,
    private reservationService: ReservationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const idFromUrl = this.route.snapshot.paramMap.get('id');
    const finalId = this.bienId || (idFromUrl ? parseInt(idFromUrl) : 0);

    if (finalId) {
      this.loadBien(finalId);
    }
  }

  loadBien(id: number): void {
    this.annonceService.getAnnonceById(id).subscribe({
      next: (data) => {
        if (data.id && data.typeLocation) {
          this.bien = {
            id: data.id,
            titre: data.titre,
            description: data.description,
            typeLocation: data.typeLocation,
            adresse: data.adresse,
            prix: data.prix
          };

          this.datePickerConfig.format = this.bien.typeLocation === 'par_nuit' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';

          this.loadIndisponibilites();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du bien:', err);
        this.isLoading = false;
        this.toastr.error('Erreur lors du chargement du bien');
      }
    });
  }

  loadIndisponibilites(): void {
    this.reservationService.getIndisponibilites(this.bien.id).subscribe({
      next: (indispo) => {
        this.indisponibilites = indispo;
        console.log("Indisponibilités chargées :", indispo);
      },
      error: (err) => {
        console.error("Erreur lors du chargement des indisponibilités :", err);
        this.toastr.warning('Erreur lors du chargement des disponibilités');
      }
    });
  }

  isDateDisabled = (date: any): boolean => {
    const d = new Date(date);
    return this.indisponibilites.some(i => {
      const start = new Date(i.dateDebut);
      const end = new Date(i.dateFin);
      return d >= start && d <= end;
    });
  };

  checkDateConflict(): void {
    if (!this.dateDebut || !this.dateFin) {
      this.dateConflict = false;
      return;
    }

    const d1 = new Date(this.dateDebut);
    const d2 = new Date(this.dateFin);

    if (d1 >= d2) {
      this.dateConflict = true;
      return;
    }

    this.dateConflict = this.indisponibilites.some(i => {
      const start = new Date(i.dateDebut);
      const end = new Date(i.dateFin);
      return (d1 <= end && d2 >= start);
    });
  }

  calculateDuration(): number {
    const startDate = new Date(this.dateDebut);
    const endDate = new Date(this.dateFin);
    const durationMs = endDate.getTime() - startDate.getTime();

    if (this.bien.typeLocation === 'par_nuit') {
      return Math.ceil(durationMs / (1000 * 3600 * 24));
    } else {
      return Math.ceil(durationMs / (1000 * 3600 * 24 * 30));
    }
  }

  calculateTotalPrice(): number {
    const duration = this.calculateDuration();
    return duration * this.bien.prix;
  }

  reserver() {
    this.checkDateConflict();

    if (this.dateConflict) {
      this.toastr.warning('Les dates sélectionnées sont indisponibles');
      return;
    }

    if (!this.dateDebut || !this.dateFin) {
      this.toastr.warning('Veuillez sélectionner une période');
      return;
    }

    const d1 = new Date(this.dateDebut);
    const d2 = new Date(this.dateFin);

    if (d1 >= d2) {
      this.toastr.warning('La date de fin doit être après la date de début');
      return;
    }

    const reservation: Reservation = {
      dateDebut: d1.toISOString(),
      dateFin: d2.toISOString(),
      biens: this.bien
      
    };

    this.reservationService.creerReservation(reservation).subscribe({
      next: () => {
        this.toastr.success('Réservation confirmée avec succès');
        this.loadIndisponibilites();
        this.dateDebut = null;
        this.dateFin = null;
      },
      error: (err) => {
        console.error('Erreur lors de la réservation:', err);
        this.toastr.error('Erreur lors de la réservation');
      }
    });
  }
}