import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Utilisateur } from '../../models/Utilisateur';
import { ImageService } from '../../services/image-service.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  currentUser: Utilisateur = {} as Utilisateur;
  imagePath: any;
  constructor(private userService: UserService,private imageService: ImageService, private authService: AuthService,) {}
  ngOnInit(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.currentUser = data;
        this.loadUserImage();
      },
      error: (err) => console.error('Erreur lors du chargement du profil', err)
    });
  }
  loadUserImage(): void {
    this.imageService.getUserImage(this.currentUser?.id).subscribe({
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
  logout(): void {
    this.authService.logoutFromServer();
    window.location.reload();
  }
 


}
