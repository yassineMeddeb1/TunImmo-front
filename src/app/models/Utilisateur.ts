import { Image } from "./Image";
import { Role } from "./Role";
import { BienImmobilier } from "./BienImmobilier";
import { Reservation } from "./Reservation";

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  adresse?: string;
  region?: string;
  motDePasse?: string;
  telephone?: string;
  enabled?: boolean;
  images?: Image[];
  imageUrls?: string[];
  roles: string[];
  biensImmobiliers?: BienImmobilier[];
  favoris?: BienImmobilier[];
  reservations?: Reservation[];
}
