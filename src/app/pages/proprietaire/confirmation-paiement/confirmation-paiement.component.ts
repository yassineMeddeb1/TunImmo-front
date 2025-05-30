import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { AbonnementService } from '../../../services/abonnement.service';
import { AuthService } from '../../../services/auth.service';
import { Utilisateur } from '../../../models/Utilisateur';

@Component({
  selector: 'app-confirmation-paiement',
  templateUrl: './confirmation-paiement.component.html',
  styleUrls: ['./confirmation-paiement.component.css']
})
export class ConfirmationPaiementComponent implements OnInit {
  abonnement: any = null;
  identifiantPaiement: string = '';
  reference: string = '';
  modePaiement: string = '';
  today: Date = new Date();
  aujourdHui: Date = new Date();
  estSucces: boolean = true;
  utilisateurActuel: Utilisateur | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private abonnementService: AbonnementService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.chargerAbonnementActuel();
    this.chargerUtilisateurActuel();

    const identifiantSession = this.route.snapshot.queryParamMap.get('session_id');
    const succes = this.route.snapshot.queryParamMap.get('success');

    if (identifiantSession) {
      this.identifiantPaiement = identifiantSession;
      this.estSucces = succes === 'true';
      console.log('Identifiant de session:', identifiantSession);
    } else {
      this.estSucces = false;
    }
  }

  chargerAbonnementActuel(): void {
    this.abonnementService.getCurrentAbonnement().subscribe({
      next: (abonnement) => {
        this.abonnement = abonnement;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de l\'abonnement actuel', err);
      }
    });
  }

  chargerUtilisateurActuel(): void {
    const utilisateur = this.authService.getCurrentUser();
    if (utilisateur) {
      this.utilisateurActuel = utilisateur;
    } else {
      console.error('Aucun utilisateur connecté');
    }
  }

  telechargerRecu(): void {
    const donneesRecu = {
      nom: this.utilisateurActuel?.nom,
      prenom: this.utilisateurActuel?.prenom,
      email: this.utilisateurActuel?.email,
      date: this.aujourdHui.toLocaleDateString(),
      montant: this.abonnement?.prix,
      typeAbonnement: this.abonnement?.type,
      reference: this.identifiantPaiement || this.reference
    };

    const documentPDF = new jsPDF();
    const logoUrl = 'assets/Immo.jpg'; // Logo

    documentPDF.addImage(logoUrl, 'JPG', 80, 10, 30, 20);

    documentPDF.setFontSize(18);
    documentPDF.text('Reçu de Paiement', 105, 40, { align: 'center' });

    documentPDF.line(20, 45, 190, 45);

    let positionY = 50;

    autoTable(documentPDF, {
      startY: positionY,
      head: [['Champ', 'Détails']],
      body: [
        ['Nom', donneesRecu.nom],
        ['Prénom', donneesRecu.prenom],
        ['Email', donneesRecu.email],
        ['Date', donneesRecu.date],
        ['Montant', `${donneesRecu.montant} TND`],
        ['Type d\'abonnement', donneesRecu.typeAbonnement],
        ['Référence', donneesRecu.reference]
      ],
      theme: 'striped',
      didDrawPage: function (data) {
        if (data.cursor) {
          positionY = data.cursor.y;
        }
      }
    });

    documentPDF.setFont('times', 'italic');
    documentPDF.setFontSize(14);
    documentPDF.text('Signature:', 20, positionY + 20);
    documentPDF.text('_________________________', 20, positionY + 30);
    documentPDF.text('TuniImmobilier', 20, positionY + 40);

    const imageSignature = 'assets/Immo.jpg'; // Image pour la signature
    documentPDF.addImage(imageSignature, 'JPG', 130, positionY + 10, 30, 30);

    documentPDF.save('Recu_paiement.pdf');
  }

  get iconeModePaiement(): string {
    return this.modePaiement === 'virement' ? 'bi-bank' : 'bi-credit-card';
  }

  get texteModePaiement(): string {
    return this.modePaiement === 'virement' ? 'Virement bancaire' : 'Carte bancaire';
  }
}
