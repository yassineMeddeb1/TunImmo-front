import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../../../models/Utilisateur';
import { UserService } from '../../../services/user.service';
import { ImageService } from '../../../services/image-service.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-proprietaire',
  templateUrl: './profile-proprietaire.component.html',
  styleUrl: './profile-proprietaire.component.css'
})
export class ProfileProprietaireComponent implements OnInit {
  user: Utilisateur = {} as Utilisateur;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  uploadedImage!: File;
  imagePath: any;

  constructor(private userService: UserService,private imageService: ImageService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loadUserImage();
      },
      error: (err) => console.error('Erreur lors du chargement du profil', err)
    });
  }

  onSubmit(): void {
    if (this.newPassword && this.newPassword !== this.confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }
  
    const updatePayload = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      adresse: this.user.adresse,
      region: this.user.region,
      telephone: this.user.telephone,
      currentPassword: this.currentPassword || null,
      newPassword: this.newPassword || null,
    };
  
    this.userService.updateProfile(updatePayload).subscribe({
      next: () => {
        alert('Profil mis à jour avec succès.');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
  
        // Appel upload image seulement si une image a été sélectionnée
        if (this.uploadedImage) {
          this.imageService.uploadImageUser(this.uploadedImage, this.uploadedImage.name, this.user.id).subscribe({
            next: () => {
              alert("Image de profil mise à jour avec succès !");
            },
            error: (err) => {
              console.error("Erreur lors du téléversement de l'image :", err);
              alert("Erreur lors du téléversement de l'image.");
            }
          });
        }
      },
      error: (error) => {
        console.error(error);
        alert("Erreur lors de la mise à jour du profil.");
      }
    });
    this.authService.refreshToken();
  }
  

  onImageUpload(event: any) {
    this.uploadedImage = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.uploadedImage);
    reader.onload = () => { this.imagePath = reader.result; }
  }
  loadUserImage(): void {
    this.imageService.getUserImage(this.user.id).subscribe({
      next: (imageBlob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imagePath = reader.result;
          console.log(this.imagePath);
        };
        reader.readAsDataURL(imageBlob);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l’image de profil', err);
      }
    });
  }
  
}