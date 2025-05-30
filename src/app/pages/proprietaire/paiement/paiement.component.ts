import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { StripeService } from '../../../services/stripe.service';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.css']
})
export class PaiementComponent implements OnInit {
  abonnement: any = null;
  modePaiement: 'carte' | 'virement' = 'carte';
  processingPayment = false;
  errorMessage: string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private stripeService: StripeService
  ) {}

  ngOnInit(): void {
    const state = this.location.getState() as any;
    if (state?.abonnement) {
      this.abonnement = state.abonnement;
    } else {
      this.router.navigate(['/abonnement']);
    }
  }

  onSubmit(): void {
    this.processingPayment = true;
    this.errorMessage = null;

    this.stripeService.initiatePayment(
      this.abonnement.type,
      this.abonnement.prix
    ).subscribe({
      next: (response: any) => {
        this.stripeService.redirectToCheckout(response.paymentToken)
          .catch(err => {
            this.errorMessage = err.message;
            this.processingPayment = false;
          });
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors du paiement';
        this.processingPayment = false;
      }
    });
  }
}