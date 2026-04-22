// Utilitaires pour les images Unsplash
// Images africaines de coiffure

// URLs directes d'images Unsplash pour coiffures africaines
// Ces images sont sélectionnées pour représenter la beauté et l'art de la coiffure africaine
// Chaque image est unique pour créer un impact visuel différent sur chaque page
const AFRICAN_HAIR_IMAGES = [
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1920&h=1080&fit=crop&auto=format&q=80', // 0 - Coiffure africaine moderne élégante
  'https://images.unsplash.com/photo-1522338242992-e1a45806c77d?w=1920&h=1080&fit=crop&auto=format&q=80', // 1 - Salon de coiffure professionnel
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1920&h=1080&fit=crop&auto=format&q=80', // 2 - Tresses et coiffures africaines traditionnelles
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1920&h=1080&fit=crop&auto=format&q=80', // 3 - Style afro moderne et contemporain
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=1920&h=1080&fit=crop&auto=format&q=80', // 4 - Salon moderne avec équipement professionnel
  'https://images.unsplash.com/photo-1570174160661-227a0c4616f7?w=1920&h=1080&fit=crop&auto=format&q=80', // 5 - Coiffure professionnelle et soin capillaire
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1920&h=1080&fit=crop&auto=format&q=80', // 6 - Beauté et art capillaire africain
  'https://images.unsplash.com/photo-1522338242992-e1a45806c77d?w=1920&h=1080&fit=crop&auto=format&q=80', // 7 - Soin et traitement capillaire
];

// Mapping des pages vers des images spécifiques pour garantir la diversité
export const PAGE_HERO_IMAGES = {
  home: 0,        // Accueil - Coiffure africaine moderne élégante
  services: 2,    // Services - Tresses et coiffures traditionnelles
  booking: 3,     // Réservation - Style afro moderne
  contact: 4,     // Contact - Salon moderne professionnel
} as const;

/**
 * Génère une URL Unsplash pour une image de coiffure africaine
 * @param width Largeur de l'image (défaut: 1920)
 * @param height Hauteur de l'image (défaut: 1080)
 * @param index Index de l'image dans la collection (optionnel, aléatoire si non fourni)
 * @returns URL de l'image Unsplash
 */
export function getAfricanHairImage(
  width: number = 1920,
  height: number = 1080,
  index?: number
): string {
  const imageIndex = index !== undefined 
    ? index % AFRICAN_HAIR_IMAGES.length
    : Math.floor(Math.random() * AFRICAN_HAIR_IMAGES.length);
  
  const baseUrl = AFRICAN_HAIR_IMAGES[imageIndex];
  
  // Remplace les dimensions dans l'URL si nécessaire
  return baseUrl.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
}

/**
 * Génère une URL Unsplash avec recherche par mots-clés (utilise Unsplash Source)
 * Note: Unsplash Source API est dépréciée mais fonctionne encore pour certaines requêtes
 * @param keywords Mots-clés de recherche (ex: "african hair salon", "braids")
 * @param width Largeur
 * @param height Hauteur
 * @returns URL Unsplash
 */
export function getUnsplashImageByKeywords(
  keywords: string,
  width: number = 1920,
  height: number = 1080
): string {
  // Utilisation de Unsplash Source API (dépréciée mais fonctionnelle)
  const query = encodeURIComponent(keywords);
  return `https://source.unsplash.com/${width}x${height}/?${query}`;
}

/**
 * Obtient une image hero spécifique pour une page donnée
 * @param page Nom de la page ('home', 'services', 'booking', 'contact')
 * @param width Largeur
 * @param height Hauteur
 * @returns URL de l'image Unsplash
 */
export function getPageHeroImage(
  page: keyof typeof PAGE_HERO_IMAGES,
  width: number = 1920,
  height: number = 1080
): string {
  const imageIndex = PAGE_HERO_IMAGES[page];
  return getAfricanHairImage(width, height, imageIndex);
}

/**
 * Images de services de coiffure professionnelles
 * Images optimisées pour les cartes et pages de détails
 */
const SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1560869713-7d563d5a80d4?w=800&h=600&fit=crop&auto=format&q=80', // Coupe homme
  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&h=600&fit=crop&auto=format&q=80', // Coupe femme
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=600&fit=crop&auto=format&q=80', // Coupe enfant
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop&auto=format&q=80', // Coloration
  'https://images.unsplash.com/photo-1522338242992-e1a45806c77d?w=800&h=600&fit=crop&auto=format&q=80', // Mèches
  'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=600&fit=crop&auto=format&q=80', // Balayage
  'https://images.unsplash.com/photo-1570174160661-227a0c4616f7?w=800&h=600&fit=crop&auto=format&q=80', // Soin
  'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=800&h=600&fit=crop&auto=format&q=80', // Brushing
  'https://images.unsplash.com/photo-1522338242992-e1a45806c77d?w=800&h=600&fit=crop&auto=format&q=80', // Chignon
];

/**
 * Obtient une image pour un service
 * @param serviceId ID du service (pour déterminer l'image)
 * @param width Largeur
 * @param height Hauteur
 * @returns URL de l'image
 */
export function getServiceImage(
  serviceId: string | number | undefined | null,
  width: number = 800,
  height: number = 600
): string {
  if (!serviceId) {
    // Retourne une image par défaut si pas d'ID
    return SERVICE_IMAGES[0]?.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`) || '';
  }
  
  // Utilise l'ID du service pour déterminer l'index de l'image
  const index = parseInt(String(serviceId).replace(/\D/g, '')) || 0;
  const imageIndex = (index - 1) % SERVICE_IMAGES.length;
  const baseUrl = SERVICE_IMAGES[imageIndex];
  
  if (!baseUrl) {
    return SERVICE_IMAGES[0]?.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`) || '';
  }
  
  return baseUrl.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
}

/**
 * Images prédéfinies pour différents contextes
 */
export const UNSplash_IMAGES = {
  africanHairSalon: getAfricanHairImage(1920, 1080, 0),
  africanBraids: getAfricanHairImage(1920, 1080, 1),
  modernSalon: getAfricanHairImage(1920, 1080, 2),
  afroStyle: getAfricanHairImage(1920, 1080, 3),
  professionalHair: getAfricanHairImage(1920, 1080, 4),
  beautySalon: getAfricanHairImage(1920, 1080, 5),
};

