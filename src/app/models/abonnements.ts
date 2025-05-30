export interface Abonnement {
  id: number;
  type: string;
  prix: number;
  dateDebut?: Date;
  dateFin?: Date;
  annoncesRestantes: number;
  status?: string;
  features: string[];
  popular?: boolean;
}

export interface Paiement {
  numeroCarte: string;
  dateExpiration: string;
  cvv: string;
  cardHolder: string;
}