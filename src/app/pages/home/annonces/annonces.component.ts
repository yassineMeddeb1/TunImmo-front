import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BienImmobilier } from '../../../models/BienImmobilier';
import { Router } from '@angular/router';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { ImageService } from '../../../services/image-service.service';
import { Gouvernorat } from '../../../models/Gouvernorat';
import { Commune } from '../../../models/Commune';
import { GoverneratCommuneService } from '../../../services/governerat-commune.service';

@Component({
  selector: 'app-annonces',
  templateUrl: './annonces.component.html',
  styleUrls: ['./annonces.component.css']
})
export class AnnoncesComponent implements OnInit {
  @ViewChild('resultsSection') resultsSection!: ElementRef;
  GovFilterServiceService: any;
  constructor(private router: Router, private annonceService: AnnonceService,
    private imageService: ImageService, private gouvcommunService:GoverneratCommuneService) {}
  EstAfficher = false;
  EstSelectGover = false;
  gouvernorats: Gouvernorat[] = [];
  communes: Commune[] = [];
  selectedGouvernoratId: number | "" = "";
  selectedComId: number | "" = "";
  selectedCityName: string = ""
    
  service = {
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  servicesData = [
    {
      image: 'assets/rent.svg',
      title: 'Louer',
      content: 'Trouvez des biens à louer',
      btn: 'Voir annonces',
      type: 'LOCATION'
    },
    {
      image: 'assets/buy.svg',
      title: 'Acheter',
      content: 'Trouvez des biens à acheter',
      btn: 'Voir annonces',
      type: 'VENTE'
    },
    {
      image: 'assets/sell.svg',
      title: 'Vendre',
      content: 'Publiez votre bien',
      btn: 'Publier',
      type: 'VENTE'
    }
  ];

  annonces: BienImmobilier[] = [];
  paginatedAnnonces: BienImmobilier[] = [];
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  pageNumbers: number[] = [];

  keyword: string = '';
  selectedCategory: string = '';
  
  typeTransaction: string = '';
  showAdvancedFilters: boolean = false;

  nombrePieces = [1, 2, 3, 4, 5];
  nombreChambres = [1, 2, 3, 4];
  nombreSallesDeBain = [1, 2, 3];
  etages = [1, 2, 3, 4, 5];

  selectedFilters: any = {
    prixMax: 1000000,
    surfaceMin: 0,
    operation: '',
    pieces: null,
    chambres: null,
    sallesDeBain: null,
    etages: null,
    surface: null,
  };

  ngOnInit() {
    this.loadGouvernorats();
    this.gouvcommunService.selectedCity$.subscribe(city => {
    if (city) {
      this.onCitySelected(city);
    }
  });
  }
  selectService(index: number) {
    if (index === 2) { // Si c'est le service "Vendre"
      this.handleVendreClick();
    } else {
      this.typeTransaction = this.servicesData[index].type;
      this.applyFilters();
    }
  }
  onCitySelected(cityInfo: {name: string, id: number}) {
    this.selectedCityName = cityInfo.name;
    this.selectedGouvernoratId = cityInfo.id;
    this.selectedComId = ""; // Réinitialiser la commune sélectionnée
    this.communes = []; // Vider la liste des communes
    this.onGouvernoratChange();
    
    // Scroll après un délai pour laisser le temps au chargement
    setTimeout(() => {
      this.scrollToResults();
    }, 300);
  }
  scrollToResults() {
    setTimeout(() => {
      if (this.resultsSection) {
        this.resultsSection.nativeElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100);
  }
  handleVendreClick() {
    // Votre logique pour gérer le clic sur "Vendre"
    // Par exemple, vérifier si l'utilisateur est propriétaire
    if (!this.isProprietaire()) {
      if (confirm("Vous devez être propriétaire pour vendre un bien. Voulez-vous créer un compte propriétaire maintenant?")) {
        this.router.navigate(['/register-proprietaire']);
      }
    } else {
      this.router.navigate(['/creer-annonce']);
    }
  }

  isProprietaire(): boolean {
    // Implémentez la vérification du rôle propriétaire
    return false; // À remplacer par votre logique
  }
  loadAnnonces() {
    const filters = {
      typeTransaction: this.typeTransaction,
      keyword: this.keyword,
      categorie: this.selectedCategory,
      gouvernorat: Number(this.selectedGouvernoratId)|| null,
      commune: Number(this.selectedComId)||null,
      ...this.selectedFilters
    };
    console.log(filters);

    this.annonceService.searchBiens(filters, this.currentPage - 1, this.itemsPerPage).subscribe(response => {
      this.annonces = response.content;
      this.EstAfficher =true;
      console.log(this.annonces);
      this.annonces.forEach(bien => {
        if (bien.id) {
          this.imageService.loadImages(bien.id).subscribe(images => {
            bien.images = images;
            bien.imageUrls = images.map(img => this.imageService.getImageUrl(img.idImage!));
          });
      }});
      this.totalPages = response.totalPages;
      this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      this.paginatedAnnonces = this.annonces;
    });
  }

  applyFilters() {
    this.loadAnnonces();
    this.scrollToResults();
  }
 loadGouvernorats(): void {
      this.gouvcommunService.getAllGouvernorats().subscribe(
        (data: Gouvernorat[]) => this.gouvernorats = data,
        (error) => console.error('Erreur lors du chargement des gouvernorats', error)
      );
    }

    onGouvernoratChange(): void {
      if (this.selectedGouvernoratId) {
        this.EstSelectGover = true;
        // Ne pas appeler applyFilters() ici, seulement charger les communes
        this.gouvcommunService.getCommunesByGouvernorat(this.selectedGouvernoratId).subscribe(
          (data: Commune[]) => {
            this.communes = data;
            this.applyFilters(); // Appeler applyFilters() après avoir chargé les communes
          },
          (error) => console.error('Erreur lors du chargement des communes', error)
        );
      } else {
        this.communes = [];
      }
    }
  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadAnnonces();
  }

  toggleFilters() {
    if (!this.selectedCategory) {
      alert("Veuillez sélectionner une catégorie avant d'appliquer des filtres !");
      return;
    }
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  toggleFavoris(annonce: BienImmobilier) {
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

  reserver(annonce: BienImmobilier) {
    this.router.navigate(['/reservation', annonce.id]);
  }

  navigateToDetails(id: number) {
    this.router.navigate(['/details-bien', id]);
  }
  // Ajoutez ces méthodes à votre composant
getCategoryIcon(category: string): string {
  switch(category) {
    case 'MAISON': return 'bi-house-door';
    case 'APPARTEMENT': return 'bi-building';
    case 'TERRAIN': return 'bi-tree';
    default: return 'bi-house';
  }
}

getTransactionIcon(type: string): string {
  return type === 'LOCATION' ? 'bi-calendar-check' : 'bi-cash-stack';
}

getPaginationPages(): (number | string)[] {
  const pages: (number | string)[] = [];
  const maxVisiblePages = 5;
  
  if (this.totalPages <= maxVisiblePages) {
    for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  
  if (this.currentPage > 3) pages.push('...');
  
  const start = Math.max(2, this.currentPage - 1);
  const end = Math.min(this.totalPages - 1, this.currentPage + 1);
  
  for (let i = start; i <= end; i++) pages.push(i);
  
  if (this.currentPage < this.totalPages - 2) pages.push('...');
  
  pages.push(this.totalPages);
  
  return pages;
}

sortAnnonces(event: any) {
  const value = event.target.value;
  
  switch(value) {
    case 'prix-asc':
      this.paginatedAnnonces.sort((a, b) => a.prix - b.prix);
      break;
    case 'prix-desc':
      this.paginatedAnnonces.sort((a, b) => b.prix - a.prix);
      break;
    case 'date-desc':
      this.paginatedAnnonces.sort((a, b) => 
        new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime());
      break;
    case 'surface-desc':
      this.paginatedAnnonces.sort((a, b) => (b.surface || 0) - (a.surface || 0));
      break;
  }
}

contactProprietaire(annonce: BienImmobilier) {
  alert(`Contacter le propriétaire de l'annonce : ${annonce.titre}`);
  // Implémentez la logique de contact
}
}
