import { Component, OnInit } from '@angular/core';
import { Utilisateur } from '../../../models/Utilisateur';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-info-personnel',
  templateUrl: './info-personnel.component.html',
  styleUrls: ['./info-personnel.component.css']
})
export class InfoPersonnelComponent implements OnInit {
  user: Utilisateur = {} as Utilisateur;
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getCurrentUserProfile().subscribe({
      next: (data) => {
        this.user = data;
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
      },
      error: (error) => {
        console.error(error);
        alert("Erreur lors de la mise à jour du profil.");
      }
    });
  }
}
