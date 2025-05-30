// register.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
declare var window: any; // Pour accéder au modal Bootstrap

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nom: string = '';
  prenom: string = '';
  region: string = '';
  adresse: string = '';
  telephone: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  roles: string[] = [];

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  verificationCode: string = ''; // Code de vérification
  regions: string[] = ['Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte'];

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onRegister() {
    if (!this.nom || !this.prenom || !this.region || !this.email || !this.password || !this.confirmPassword || this.roles.length === 0) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    const user = {
      nom: this.nom,
      prenom: this.prenom,
      region: this.region,
      adresse: this.adresse,
      telephone: this.telephone,
      email: this.email,
      motDePasse: this.password,
      roles: this.roles // ✅ Envoie bien un tableau des rôles
    };

    this.authService.register(user).subscribe(
      (response) => {
        console.log('Inscription réussie', response);
        alert('Inscription réussie !');

        // Ouvrir le modal de vérification après l'inscription
        const verificationModal = new window.bootstrap.Modal(
          document.getElementById('verificationModal')
        );
        verificationModal.show();
      },
      (error) => {
        console.error('Erreur lors de l\'inscription', error);
        alert('Erreur lors de l\'inscription');
      }
    );
  }

  // register.component.ts
  onVerifyCode() {
    if (!this.verificationCode) {
      alert('Veuillez entrer le code de vérification.');
      return;
    }

    this.authService.verifyCode(this.email, this.verificationCode).subscribe(
      (response) => {
        alert(response); // Affiche le message renvoyé par le backend
        if (response === 'Compte vérifié avec succès !') {
          this.router.navigate(['/login']);
        } else {
          alert('Erreur lors de la vérification.');
        }
      },
      (error) => {
        console.error('Erreur lors de la vérification', error);
        alert('Erreur lors de la vérification. Veuillez réessayer.');
      }
    );
  }

}
