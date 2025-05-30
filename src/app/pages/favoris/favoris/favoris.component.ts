import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Annonce } from '../../../models/Annonce';
import { ToastrService } from 'ngx-toastr';
import { ImageService } from '../../../services/image-service.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-favoris',
  templateUrl: './favoris.component.html',
  styleUrls: ['./favoris.component.css'],
})
export class FavorisComponent implements OnInit {
  public favoris: Annonce[] = []; // Liste des favoris
  private subs = new Subscription();
  

  constructor(private router: Router, private toastr: ToastrService,private imageService: ImageService) {}

  ngOnInit(): void {
    this.chargerFavoris();
  }
  
  chargerFavoris(): void {
    const favorisData = localStorage.getItem('favoris');
    if (favorisData) {
      this.favoris = JSON.parse(favorisData);
  
      // Charger les images pour chaque bien
      this.favoris.forEach((bien, index) => {
        this.loadImagesForBien(bien, index);
      });
    }
  }
  
  loadImagesForBien(bien: Annonce, index: number): void {
    this.subs.add(
      this.imageService.loadImages(bien.id).subscribe({
        next: (images) => {
          this.favoris[index].images = images.map(img =>
            this.imageService.getImageUrl(img.idImage!)
          );
        },
        error: (err) => console.error(`Erreur lors du chargement des images pour le bien ${bien.id}:`, err)
      })
    );
  }
  
  // Retirer un bien des favoris
  retirerDesFavoris(bienId: number): void {
    this.favoris = this.favoris.filter((bien) => bien.id !== bienId);
    localStorage.setItem('favoris', JSON.stringify(this.favoris));
    this.toastr.success('Bien retiré des favoris', 'Succès');
  }

  // Accéder à la page de détails du bien
  voirDetails(bienId: number): void {
    this.router.navigate(['details-bien', bienId]);
  }

  // Réserver un bien
  reserver(bienId: number): void {
    const bien = this.favoris.find((f) => f.id === bienId);
    if (bien) {
      if (bien.disponible ) {
        this.toastr.success('Réservation effectuée avec succès', 'Succès');
        // Mettre à jour l'état
      } else {
        this.toastr.error('Ce bien n\'est pas disponible', 'Erreur');
      }
    }
  }
}