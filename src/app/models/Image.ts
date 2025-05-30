import { BienImmobilier } from "./BienImmobilier";
import { Utilisateur } from "./Utilisateur";

export class Image {
  idImage?: number;
  name!: string;    
  type!: string;
  image!: string; // Base64 ou URL
  preview?: string;
  bienImmobilier?: BienImmobilier;
  utilisateur?: Utilisateur;
}
