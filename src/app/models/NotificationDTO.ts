export enum NotificationType {
  NOUVELLE_RESERVATION = 'NOUVELLE_RESERVATION',
  RESERVATION_CONFIRMEE = 'RESERVATION_CONFIRMEE',
  RESERVATION_ANNULEE = 'RESERVATION_ANNULEE',
  PAIEMENT_EFFECTUE = 'PAIEMENT_EFFECTUE',
  AVIS_RECU = 'AVIS_RECU',
  MESSAGE_NON_LU = 'MESSAGE_NON_LU',
  NOUVELLE_ANNONCE = 'NOUVELLE_ANNONCE'
}

export interface NotificationDTO {
  id: number;
  message: string;
  type: NotificationType;
  lu: boolean;
  dateEnvoi: string;
  reservationId?: number;
  destinataireId?: number;
  emetteurId?: number;
  emetteurNom?: string;
  lienAction?: string;
  metadata?: any;
}

export interface NotificationPage {
  content: NotificationDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}