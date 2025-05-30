// dans un fichier par exemple `models/BienSimple.ts`
export interface BienSimple {
    id: number;
    titre: string;
    description: string;
    typeLocation:string;
    adresse: string;
    prix: number;
    imageUrls?: string[];
  }
  