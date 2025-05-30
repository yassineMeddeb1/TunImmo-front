import { Categorie } from "./Categorie";
import { Utilisateur } from "./Utilisateur";
import { Image } from "./Image";
import { Gouvernorat } from "./Gouvernorat";
import { Commune } from "./Commune";
import { Avis } from "./Avis";
import { Reservation } from "./Reservation";

export class BienImmobilier {
  id?: number;
  titre!: string;
  description!: string;
  adresse!: string;
  prix!: number;
  disponible!: boolean;
  typeTransaction!: string;
  typeLocation?: string; // Ajouté

  dateAjout!: Date;
  surface!: number;
  localisation!: string;

  nombresChambres?: number;
  nombresPieces?: number;
  nombresSalledebain?: number;

  jardin?: boolean;
  garage?: boolean;
  climatiseur?: boolean;
  piscine?: boolean;
  balcon?: boolean;
  vueSurMer?: boolean;
  wifi?: boolean;
  meuble?: boolean; // Ajouté
  chargesIncluses?: boolean; // Ajouté
  statutJuridique?: string; // Ajouté
  ascenseur?: boolean;
  interphone?: boolean;

  nombresEtages?: number;
  superficie?: number;
  constructible?: boolean;
  isVerifieAdmin!: number;
  statutAdmin!: string;

  categorie?: Categorie;
  proprietaire?: Utilisateur;
  images!: Image[];
  imageUrls?: string[];

  gouvernorat?: Gouvernorat;
  gouvernoratId?: number;
  commune?: Commune;
  communeDetails?: Commune;

  avis?: Avis[];
  reservations?: Reservation[];
  utilisateursFavoris?: Utilisateur[];
}
