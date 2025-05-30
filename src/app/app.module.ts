import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NavbarComponent } from './components/navbar/navbar.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HeroComponent } from './pages/home/hero/hero.component';
import { AnnoncesComponent } from './pages/home/annonces/annonces.component';
import { HomeComponent } from './pages/home/home/home.component';
import { SearchBarComponent } from './pages/home/search-bar/search-bar.component';
import { WhyChooseUsComponent } from './pages/home/why-choose-us/why-choose-us.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/connexion/login/login.component';
import { RegisterComponent } from './pages/connexion/register/register.component';
import { DetailsComponent } from './pages/BienImmobilier/details/details.component';
import { FavorisComponent } from './pages/favoris/favoris/favoris.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { InfoPersonnelComponent } from './pages/profile/info-personnel/info-personnel.component';
import { MessangesComponent } from './pages/profile/messanges/messanges.component';
import { ListeReservationComponent } from './pages/profile/reservation/reservation.component';
import { ProprietaireDashComponent } from './pages/proprietaire/proprietaire-dash/proprietaire-dash.component';
import { ListeAnnoncesComponent } from './pages/proprietaire/liste-annonces/liste-annonces.component';
import { StatistiquesComponent } from './pages/proprietaire/statistiques/statistiques.component';
import { Sidebar2Component } from './pages/proprietaire/sidebar2/sidebar2.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AbonnementComponent } from './pages/proprietaire/abonnement/abonnement.component';
import { ReservationsComponent } from './pages/proprietaire/reservations/reservations.component';
import { ReservationComponent } from './pages/BienImmobilier/reservation/reservation.component';
import { ProfileProprietaireComponent } from './pages/proprietaire/profile-proprietaire/profile-proprietaire.component';
import { PaiementComponent } from './pages/proprietaire/paiement/paiement.component';
import { StatistiquesAdminComponent } from './pages/Admin/statistiques-admin/statistiques-admin.component';
import { SidebarAdminComponent } from './pages/Admin/sidebar-admin/sidebar-admin.component';
import { UtilisateursAdminComponent } from './pages/Admin/utilisateurs-admin/utilisateurs-admin.component';
import { DashAdminComponent } from './pages/Admin/dash-admin/dash-admin.component';
import { PaiementsAdminComponent } from './pages/Admin/paiements-admin/paiements-admin.component';
import { GestionAnnoncesComponent } from './pages/Admin/gestion-annonces/gestion-annonces.component';
import { HttpClientModule } from '@angular/common/http';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { SearchCountryComponent } from './pages/home/search-country/search-country.component';
import { CatalogueComponent } from './pages/catalogue/catalogue.component';
import { ForbiddenComponent } from './pages/errors/forbidden/forbidden.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './Interceptors/auth.interceptor';
import { ErrorInterceptor } from './Interceptors/erreur.interceptor';
import { DpDatePickerModule } from 'ng2-date-picker';
import { ForgotPasswordComponent } from './pages/connexion/forgot-password/forgot-password.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { NotificationsListComponent } from './components/notifications/notifications-list/notifications-list.component';
import { NotificationBellComponent } from './components/notifications/notification-bell/notification-bell.component';
import { NotificationTypePipe } from './Pipe/notification-type.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import{ GestionAnnoncePropComponent } from './pages/proprietaire/Gestion-annonceProp/gestion-annonceProp.component';
import { ConfirmationPaiementComponent } from './pages/proprietaire/confirmation-paiement/confirmation-paiement.component';
import { TruncatePipe } from './Pipe/truncate.pipe';
@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeroComponent,
    AnnoncesComponent,
    HomeComponent,
    SearchBarComponent,
    WhyChooseUsComponent,
    FooterComponent,
    LoginComponent,
    RegisterComponent,
    DetailsComponent,
    FavorisComponent,
    ReservationComponent,
    ProfileComponent,
   
    InfoPersonnelComponent,
    MessangesComponent,
    ListeReservationComponent,
    ProprietaireDashComponent,
    ListeAnnoncesComponent,
    StatistiquesComponent,
    Sidebar2Component,
    AbonnementComponent,
    ReservationsComponent,
    ProfileProprietaireComponent,
    PaiementComponent,
    StatistiquesAdminComponent,
    SidebarAdminComponent,
    UtilisateursAdminComponent,
    DashAdminComponent,
    PaiementsAdminComponent,
    GestionAnnoncesComponent,
    SearchCountryComponent,
    CatalogueComponent,
    ForbiddenComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    NotificationsListComponent,
    NotificationBellComponent,
    NotificationTypePipe,
    GestionAnnoncePropComponent,
    ConfirmationPaiementComponent,
    TruncatePipe
    
    ],
  imports: [
    BrowserModule,
    AppRoutingModule, 
    MatToolbarModule,
    MatButtonModule,
    FormsModule,
    BrowserAnimationsModule, 
    ToastrModule.forRoot(),
    MatCardModule,
    FontAwesomeModule,
    HttpClientModule,
    SlickCarouselModule,
    DpDatePickerModule,
    ReactiveFormsModule,
    InfiniteScrollModule
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,  // AuthInterceptor pour ajouter le token
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,  // ErrorInterceptor pour capturer les erreurs
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
