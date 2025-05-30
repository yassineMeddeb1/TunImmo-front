import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environements/environment';

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private apiUrl = environment.apiUrl;
  private stripePromise = loadStripe(environment.stripePublishableKey);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  initiatePayment(abonnementType: string, amount: number): Observable<any> {
    const headers = this.getAuthHeaders();
    const paymentData = {
      type: abonnementType,
      amount: amount,
      note: `Abonnement ${abonnementType}`
    };

    return this.http.post(`${this.apiUrl}/abonnements/initiate-payment`, paymentData, { headers });
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const stripe = await this.stripePromise;
  
    if (!stripe) {
      throw new Error('Stripe failed to load.');
    }
  
    const { error } = await stripe.redirectToCheckout({ sessionId });
  
    if (error) {
      throw error;
    }
  }
  

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.getCurrentUser();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-User-Id': currentUser?.id?.toString() || ''
    });
  }
}