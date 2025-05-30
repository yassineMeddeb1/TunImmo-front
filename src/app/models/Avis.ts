import { BienImmobilier } from "./BienImmobilier";

export interface Avis {
  id?: number;
  note: number;
  commentaire: string;
  date: Date;
  clientNom:string;
  clientPrenom:string;

  bienImmobilier: BienImmobilier;
}
