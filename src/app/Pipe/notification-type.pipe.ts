import { Pipe, PipeTransform } from '@angular/core';
import { NotificationType } from '../models/NotificationDTO';

@Pipe({
  name: 'notificationType'
})
export class NotificationTypePipe implements PipeTransform {
  transform(value: NotificationType): string {
    switch(value) {
      case NotificationType.NOUVELLE_RESERVATION:
        return 'Nouvelle réservation';
      case NotificationType.RESERVATION_CONFIRMEE:
        return 'Confirmée';
      case NotificationType.RESERVATION_ANNULEE:
        return 'Annulée';
      case NotificationType.PAIEMENT_EFFECTUE:
        return 'Paiement';
      case NotificationType.AVIS_RECU:
        return 'Avis';
      case NotificationType.MESSAGE_NON_LU:
        return 'Message';
      default:
        return value;
    }
  }
}