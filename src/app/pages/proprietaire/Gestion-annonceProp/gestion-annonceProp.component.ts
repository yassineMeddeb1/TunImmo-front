import { Component, OnInit } from '@angular/core';
import { AnnonceService } from '../../../services/AnnonceService.service';
import { BienImmobilier } from '../../../models/BienImmobilier';
import { Categorie } from '../../../models/Categorie';
import { Gouvernorat } from '../../../models/Gouvernorat';
import { Commune } from '../../../models/Commune';
import { Image } from '../../../models/Image';
import { ImageService } from '../../../services/image-service.service';
import { GoverneratCommuneService } from '../../../services/governerat-commune.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-gestion-annonce',
  templateUrl: './gestion-annonceProp.component.html',
  styleUrls: ['./gestion-annonceProp.component.css']
})
export class GestionAnnoncePropComponent implements OnInit {
  isEditMode: boolean = false;
  annonceId?: number;
  annonce: BienImmobilier = this.initAnnonce();

  Listcategories: Categorie[] = [];
  newCat!: Categorie;
  uploadedImages: File[] = [];
  myImages: string[] = [];
  isImageUpdated: boolean = false;
  imagePath: any;

  gouvernorats: Gouvernorat[] = [];
  communes: Commune[] = [];
  selectedComId!: number;
  selectedGouvernoratId!: number;
 
  constructor(
    private annonceService: AnnonceService,
    private imageService: ImageService,
    private gouvcommunService: GoverneratCommuneService,
    private route: ActivatedRoute,
    public router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.annonceId = +params['id'];
        this.loadAnnonce(this.annonceId);
      }
    });

    this.loadCategories();
    this.loadGouvernorats();
  }

  private initAnnonce(): BienImmobilier {
    return {
      titre: '',
      description: '',
      adresse: '',
      prix: 0,
      disponible: true,
      typeTransaction: '',
      typeLocation: '',
      dateAjout: new Date(),
      surface: 0,
      localisation: '',
      nombresChambres: 0,
      nombresPieces: 0,
      nombresSalledebain: 0,
      jardin: false,
      garage: false,
      climatiseur: false,
      piscine: false,
      balcon: false,
      vueSurMer: false,
      wifi: false,
      meuble: false,
      chargesIncluses: false,
      statutJuridique: '',
      ascenseur: false,
      interphone: false,
      nombresEtages: 0,
      superficie: 0,
      constructible: false,
      isVerifieAdmin: 0,
      statutAdmin: 'En attente',
      images: [],
      commune: undefined,
      categorie: undefined
    };
  }

  private loadAnnonce(id: number): void {
    this.annonceService.getAnnonceById(id).subscribe(
      (annonce) => {
        this.annonce = annonce;
        console.log(this.annonce);
        this.newCat = annonce.categorie!;
        
        // Set gouvernorat and commune
        if (annonce.commune) {
          this.selectedGouvernoratId = annonce.gouvernorat?.id!;
          this.selectedComId = annonce.commune.id!;
          this.onGouvernoratChange();
        }

        // Load images
        if (annonce.id) {
          this.imageService.loadImages(annonce.id).subscribe(images => {
            this.annonce.images = images.map(img => ({
              ...img,
              preview: this.imageService.getImageUrl(img.idImage!)
            }));
          });
        }
      },
      (error) => {
        this.toastr.error('Erreur lors du chargement de l\'annonce', 'Erreur');
        this.router.navigate(['/proprietaire/gestion-annonce']);
      }
    );
  }

  private loadCategories(): void {
    this.annonceService.listeCategorie().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.Listcategories = response;
        } else if (response._embedded && response._embedded.categorie) {
          this.Listcategories = response._embedded.categorie;
        } else {
          console.error('Unexpected response structure:', response);
          this.Listcategories = [];
        }
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.toastr.error('Erreur lors du chargement des catégories', 'Erreur');
      }
    );
  }

  private loadGouvernorats(): void {
    this.gouvcommunService.getAllGouvernorats().subscribe(
      (data: Gouvernorat[]) => {
        this.gouvernorats = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des gouvernorats', error);
        this.toastr.error('Erreur lors du chargement des gouvernorats', 'Erreur');
      }
    );
  }

  onGouvernoratChange(): void {
    if (this.selectedGouvernoratId) {
      this.gouvcommunService.getCommunesByGouvernorat(this.selectedGouvernoratId).subscribe(
        (data: Commune[]) => {
          this.communes = data;
          // Si en mode édition et que la commune est déjà sélectionnée, on la conserve
          if (this.isEditMode && this.selectedComId) {
            const selectedCommune = this.communes.find(c => c.id === this.selectedComId);
            if (!selectedCommune) {
              this.selectedComId = this.communes[0]?.id;
            }
          }
        },
        (error) => {
          console.error('Erreur lors du chargement des communes', error);
          this.toastr.error('Erreur lors du chargement des communes', 'Erreur');
        }
      );
    } else {
      this.communes = [];
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length) {
      this.uploadedImages = [];
      
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        this.uploadedImages.push(file);
        
        const reader = new FileReader();
        reader.onload = () => {
          const newImage: Image = {
            name: file.name,
            type: file.type,
            image: (reader.result as string).split(',')[1],
            preview: reader.result as string
          };
          this.annonce.images.push(newImage);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(): void {
    // Validation des champs obligatoires
    if (!this.validateForm()) {
      return;
    }

    this.gouvcommunService.getCommuneById(this.selectedComId).subscribe(
      (commune: Commune) => {
        this.annonce.commune = commune;

        const annonceToSend = {
          ...this.annonce,
          commune: this.annonce.commune,
          categorie: this.newCat
        };
        console.log('Annonce à envoyer:', annonceToSend);
        if (this.isEditMode && this.annonceId) {
          this.updateAnnonce(annonceToSend);
        } else {
          this.createAnnonce(annonceToSend);
        }
      },
      (error) => {
        console.error('Erreur lors du chargement de la commune:', error);
        this.toastr.error('Erreur lors de la sélection de la commune', 'Erreur');
      }
    );
  }

  private validateForm(): boolean {
    if (!this.annonce.titre || !this.annonce.description || !this.annonce.typeTransaction || 
        !this.selectedGouvernoratId || !this.selectedComId || !this.annonce.adresse || 
         !this.annonce.prix || !this.newCat) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires', 'Champs manquants');
      return false;
    }
    return true;
  }

   createAnnonce(annonce: any): void {
    this.annonceService.ajouterAnnonce(annonce).subscribe(
      (createdAnnonce: BienImmobilier) => {
        this.toastr.success('Annonce créée avec succès', 'Succès');
        if (createdAnnonce.id && this.annonce.images.length > 0) {
          this.associateAllImagesWithBien(createdAnnonce.id);
        }
        this.router.navigate(['/proprietaire/annonces']);
      },
      (error) => {
        console.error('Erreur création annonce:', error);
        this.toastr.error('Erreur lors de la création de l\'annonce', 'Erreur');
      }
    );
  }

   updateAnnonce(annonce: any): void {
    if (!this.annonceId) return;
    
    this.annonceService.updateAnnonce(this.annonceId, annonce).subscribe(
      (updatedAnnonce: BienImmobilier) => {
        this.toastr.success('Annonce mise à jour avec succès', 'Succès');
        if (updatedAnnonce.id && this.annonce.images.length > 0) {
          this.associateAllImagesWithBien(updatedAnnonce.id);
        }
        this.router.navigate(['/proprietaire/annonces']);
      },
      (error) => {
        console.error('Erreur mise à jour annonce:', error);
        this.toastr.error('Erreur lors de la mise à jour de l\'annonce', 'Erreur');
      }
    );
  }

  private associateAllImagesWithBien(bienId: number): void {
    this.annonce.images.forEach(image => {
      if (image.preview && !image.idImage) { // Ne traiter que les nouvelles images
        const blob = this.dataURItoBlob(image.preview);
        const file = new File([blob], image.name, { type: image.type });
        
        this.imageService.uploadImageForBien(
          file, 
          image.name, 
          bienId
        ).subscribe(
          (associatedImg: Image) => {
            console.log('Image associée avec succès:', associatedImg);
          },
          (error: any) => {
            console.error('Erreur association image:', error);
          }
        );
      }
    });
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  }

  removeImage(index: number): void {
    this.annonce.images.splice(index, 1);
  }

  triggerFileInput(): void {
    document.getElementById('file-input')?.click();
  }

  getEmptyImageSlots(): number[] {
    const maxImages = 10;
    return Array(maxImages - this.annonce.images.length).fill(0);
  }

  onCategoryChange(): void {
    if (this.newCat?.id === 3) { // Si c'est un terrain
      this.resetNonApplicableFields();
    }
  }

  private resetNonApplicableFields(): void {
    this.annonce.nombresChambres = 0;
    this.annonce.nombresPieces = 0;
    this.annonce.nombresSalledebain = 0;
    this.annonce.nombresEtages = 0;
  }
}