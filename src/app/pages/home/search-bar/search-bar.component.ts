import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BienImmobilier } from '../../../models/BienImmobilier';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { ImageService } from '../../../services/image-service.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit {
  config = {
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    arrows: true,
    draggable: false,
    swipe: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, slidesToScroll: 1, draggable: false, swipe: false }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1, draggable: false, swipe: false }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1, draggable: false, swipe: false }
      }
    ]
  };
  
  galleryFilter = 'MAISON';
  filterredImages: BienImmobilier[] = [];
  topOfferData: BienImmobilier[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private annonceService: AnnonceService,
    private imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.loadTopOffers();
    this.loadTodayAdded();
  }

  

  loadTopOffers(): void {
    this.annonceService.getTopOffers().subscribe({
      next: (data) => {
        console.log(data);
        this.topOfferData = data;
        this.isLoading = false;
        
        // Charger les images pour chaque bien
        this.topOfferData.forEach(bien => {
          if (bien.id) {
            this.imageService.loadImages(bien.id).subscribe(images => {
              bien.images = images;
              bien.imageUrls = images.map(img => this.imageService.getImageUrl(img.idImage!));
            });
          }
        });
      },
      error: (err) => {
        console.error('Error loading top offers:', err);
        this.isLoading = false;
      }
    });
  }

  loadTodayAdded(): void {
    this.annonceService.getTodayAdded().subscribe({
      next: (data) => {
        console.log("today",data);
        this.filterredImages = data;
        this.isLoading = false;
        
        // Charger les images pour chaque bien
        this.filterredImages.forEach(bien => {
          if (bien.id) {
            this.imageService.loadImages(bien.id).subscribe(images => {
              bien.images = images;
              bien.imageUrls = images.map(img => this.imageService.getImageUrl(img.idImage!));
            });
          }
        });
      },
      error: (err) => {
        console.error('Error loading top offers:', err);
        this.isLoading = false;
      }
    });
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/details-bien', id]);
  }

  toggleFavoris(annonce: BienImmobilier, event: Event): void {
    event.stopPropagation();
    const favoris: BienImmobilier[] = JSON.parse(localStorage.getItem('favoris') || '[]');
    const index = favoris.findIndex(f => f.id === annonce.id);

    if (index === -1) {
      favoris.push(annonce);
    } else {
      favoris.splice(index, 1);
    }

    localStorage.setItem('favoris', JSON.stringify(favoris));
  }

  isFavoris(annonce: BienImmobilier): boolean {
    const favoris: BienImmobilier[] = JSON.parse(localStorage.getItem('favoris') || '[]');
    return favoris.some(f => f.id === annonce.id);
  }

  reserver(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/reservation', id]);
  }
}