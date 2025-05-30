import { Component, OnInit } from '@angular/core';

interface Utilisateur {
  id: number;
  image: string;
  nom: string;
  prenom: string;
  email: string;
}

interface Paiement {
  id: number;
  utilisateur: Utilisateur;
  montant: number;
  date: Date;
  methode: string;
  statut: 'payé' | 'en_attente' | 'annulé';
}

@Component({
  selector: 'app-paiements-admin',
  templateUrl: './paiements-admin.component.html',
  styleUrls: ['./paiements-admin.component.css'],
})
export class PaiementsAdminComponent implements OnInit {
  // Données simulées des paiements
  paiements: Paiement[] = [
    {
      id: 1,
      utilisateur: {
        id: 1,
        image: 'assets/yassine.jpg',
        nom: 'Ben Ali',
        prenom: 'Ahmed',
        email: 'ahmed@example.com',
      },
      montant: 100,
      date: new Date('2023-10-01'),
      methode: 'Carte bancaire',
      statut: 'payé',
    },
    {
      id: 2,
      utilisateur: {
        id: 2,
        image: 'assets/yassine.jpg',
        nom: 'Bouazizi',
        prenom: 'Fatma',
        email: 'fatma@example.com',
      },
      montant: 50,
      date: new Date('2023-09-15'),
      methode: 'Virement',
      statut: 'en_attente',
    },
    {
      id: 3,
      utilisateur: {
        id: 3,
        image: 'assets/yassine.jpg',
        nom: 'Trabelsi',
        prenom: 'Mohamed',
        email: 'mohamed@example.com',
      },
      montant: 200,
      date: new Date('2023-08-20'),
      methode: 'Carte bancaire',
      statut: 'annulé',
    },
  ];

  // Filtres
  searchQuery: string = '';
  selectedStatut: string = '';
  paiementsFiltres: Paiement[] = [];

  ngOnInit(): void {
    this.filtrerPaiements();
  }

  // Filtrer les paiements
  filtrerPaiements(): void {
    this.paiementsFiltres = this.paiements.filter((paiement) => {
      const matchesSearch =
        paiement.utilisateur.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        paiement.utilisateur.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatut = this.selectedStatut ? paiement.statut === this.selectedStatut : true;
      return matchesSearch && matchesStatut;
    });
  }

  // Valider un paiement
  validerPaiement(id: number): void {
    const paiement = this.paiements.find((p) => p.id === id);
    if (paiement) {
      paiement.statut = 'payé';
      alert(`Paiement ${id} validé avec succès !`);
    }
  }

  // Annuler un paiement
  annulerPaiement(id: number): void {
    const paiement = this.paiements.find((p) => p.id === id);
    if (paiement) {
      paiement.statut = 'annulé';
      alert(`Paiement ${id} annulé avec succès !`);
    }
  }
}