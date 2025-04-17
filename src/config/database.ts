import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// URL publique MySQL fournie par Railway
const MYSQL_PUBLIC_URL = process.env.MYSQL_PUBLIC_URL || 'mysql://root:JlbiPXIefNsJoTyOKpUQBnYeWQBWESsS@mainline.proxy.rlwy.net:17032/railway';

// Afficher les informations de débogage
console.log('\n=== CONNEXION MYSQL AVEC URL PUBLIQUE ===');
console.log('Utilisation de l\'URL publique MySQL (masquée):', MYSQL_PUBLIC_URL.replace(/:[^:]*@/, ':****@'));

// Déclarer la variable sequelize
let sequelize: Sequelize;

// Créer une instance Sequelize directement avec l'URL publique
console.log('\n=== TENTATIVE DE CONNEXION AVEC URL PUBLIQUE ===');

sequelize = new Sequelize(MYSQL_PUBLIC_URL, {
  dialect: 'mysql',
  logging: true, // Activer les logs SQL pour le débogage
  dialectOptions: {
    // Configuration SSL pour connexions externes
    ssl: {
      rejectUnauthorized: false
    }
  }
});

// Ajouter un gestionnaire d'erreur spécifique pour le diagnostic
process.on('unhandledRejection', (reason, promise) => {
  console.log('\n=== ERREUR NON GÉRÉE DÉTECTÉE ===');
  console.log('Raison:', reason);
});

console.log('\n=== CONFIGURATION DE LA BASE DE DONNÉES TERMINÉE ===');

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('💾[database]: Connection has been established successfully.');
    
    // Sync database schema
    // En production, on synchronise une seule fois au démarrage
    // En développement, on utilise alter:true pour mettre à jour le schéma automatiquement
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ force: false }); // Ne pas forcer la recréation des tables
      console.log("Production: Database schema synchronized.");
    } else {
      await sequelize.sync({ alter: true });
      console.log("Development: All models were synchronized with alter:true.");
    }
  } catch (error) {
    console.error('❌[database]: Unable to connect to the database:', error);
    console.error('Database connection details (without credentials):');
    console.error(`- URL: ${MYSQL_PUBLIC_URL.replace(/:[^:]*@/, ':****@')}`);
    console.error('Please check your environment variables and database configuration.');
    
    // In production, we'll retry a few times before giving up
    if (process.env.NODE_ENV === 'production') {
      console.log('Retrying connection in 5 seconds...');
      setTimeout(() => connectDB(), 5000);
    } else {
      process.exit(1); // Only exit in development
    }
  }
};

export default sequelize;
