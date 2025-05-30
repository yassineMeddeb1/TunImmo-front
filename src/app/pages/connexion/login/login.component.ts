// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
declare var window: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  forgotPasswordForm: FormGroup;
  forgotPasswordMessage: string = '';
  forgotPasswordError: string = '';
  isSubmitting: boolean = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    this.authService.login({ email: this.email, motDePasse: this.password }).subscribe(
      (response) => {
        console.log('Connexion réussie', response);
        this.setSecureCookie('token', response.token);
        alert('Connexion réussie !');
        this.redirectBasedOnRole(response.roles);
      },
      (error) => {
        console.error('Erreur de connexion', error);
        alert('Erreur de connexion');
      }
    );
  }

  openForgotPasswordModal() {
    const modal = new window.bootstrap.Modal(document.getElementById('forgotPasswordModal')!);
    modal.show();
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';
    this.forgotPasswordForm.reset();
  }

  onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.invalid) return;

    this.isSubmitting = true;
    this.forgotPasswordMessage = '';
    this.forgotPasswordError = '';

    const email = this.forgotPasswordForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.forgotPasswordMessage = 'Un lien de réinitialisation a été envoyé à votre email.';
        this.isSubmitting = false;
      },
      error: (err) => {
        this.forgotPasswordError = "Une erreur s'est produite. Veuillez réessayer.";
        this.isSubmitting = false;
        console.error('Erreur lors de la demande de réinitialisation', err);
      }
    });
  }

  setSecureCookie(name: string, value: string) {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 60);
    document.cookie = `${name}=${value}; Secure; SameSite=Strict; expires=${expirationDate.toUTCString()}; path=/`;
  }

  redirectBasedOnRole(roles: any[]) {
    const roleTypes = roles.map(role => role.roleType);
    
    if (roleTypes.includes('ADMIN')) {
      this.router.navigate(['/admin']);
    } else if (roleTypes.includes('PROPRIETAIRE')) {
      this.router.navigate(['/proprietaire']);
    } else if (roleTypes.includes('VISITEUR')) {
      this.router.navigate(['/home']);
    } else {
      alert('Rôle non autorisé');
    }
  }
}