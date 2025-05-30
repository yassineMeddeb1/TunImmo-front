import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string = '';
  error: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const email = this.form.value.email;
      this.authService.forgotPassword(email).subscribe({
        next: () => {
          this.message = 'Un lien de réinitialisation a été envoyé à votre email.';
          this.error = '';
        },
        error: err => {
          this.error = "Une erreur s'est produite.";
          this.message = '';
        },
      });
    }
  }
}
