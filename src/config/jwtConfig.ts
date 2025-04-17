import dotenv from 'dotenv';

dotenv.config();

// Générer une valeur JWT_SECRET stable pour la session
// En production, cette valeur sera constante pendant la durée de vie du processus
let generatedSecret: string | null = null;

/**
 * Obtient la clé JWT_SECRET, avec une valeur par défaut en production si nécessaire
 * @returns La clé JWT_SECRET à utiliser pour signer et vérifier les tokens
 */
export const getJwtSecret = (): string => {
  // Utiliser la variable d'environnement si elle existe
  const envSecret = process.env.JWT_SECRET;
  if (envSecret) {
    return envSecret;
  }

  // En production, générer une valeur par défaut (une seule fois par session)
  if (process.env.NODE_ENV === 'production') {
    if (!generatedSecret) {
      console.warn('WARNING: JWT_SECRET not defined, using a generated value for production. This is not recommended for security reasons and will change on restart.');
      generatedSecret = 'dbz-production-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    }
    return generatedSecret;
  }

  // En développement, exiger une valeur explicite
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1); // Exit if JWT_SECRET is not set in development
  return ''; // Cette ligne ne sera jamais atteinte
};

// Exporter la fonction pour obtenir le secret
export default getJwtSecret;
