export interface Annonce {
  id: number; // Identifiant unique
  titre: string; // Titre de l'annonce
  description: string; // Description détaillée
  region: string; // Région du bien
  ville: string; // Ville du bien
  adresse: string; // Adresse précise
  prix: number; // Prix du bien
  category: 'maison'|'appartement'|'terrain'; // Catégorie (maison, appartement, terrain)
  disponible: boolean; // Disponibilité du bien
  operation: 'Vente' | 'Location'; // Type de transaction (Vente ou Location)
  dateAjout: Date; // Date d'ajout de l'annonce
  images: string[]; // Liste des URLs des images
  localisation: string; // Localisation (coordonnées ou adresse)
  surface: number; // Surface du bien (en m²)
  mapUrl: string; // URL de la carte Google Maps (ajouté ici)
  statutAdmin: string;

  // Options spécifiques aux maisons et appartements
  nombresChambres?: number; // Nombre de chambres (maison/appartement)
  nombresPieces?: number; // Nombre de pièces (maison/appartement)
  nombresSallesDeBain?: number; // Nombre de salles de bain (maison/appartement)
  climatiseur?: boolean; // Présence d'un climatiseur
  jardin?: boolean; // Présence d'un jardin
  garage?: boolean; // Présence d'un garage
  chauffage?: boolean; // Présence d'un chauffage
  balcon?: boolean; // Présence d'un balcon
  vueSurMer?: boolean; // Vue sur la mer
  wifi?: boolean;

  // Options spécifiques aux appartements
  nombresEtages?: number; // Nombre d'étages (appartement uniquement)

  // Options spécifiques aux terrains
  // Les terrains n'ont pas d'options supplémentaires

  // Propriétaire
  proprietaire: {
    nom: string; // Nom du propriétaire
    photo?: string; // Photo de profil du propriétaire (optionnelle)
    telephone: string; // Téléphone du propriétaire
    email: string; // Email du propriétaire
  };
}