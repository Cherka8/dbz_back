import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Fonction de débogage pour afficher les variables d'environnement pertinentes de Railway
function debugRailwayVariables() {
  console.log('\n=== RAILWAY MYSQL VARIABLES DEBUG ===');
  console.log('MYSQL_URL:', process.env.MYSQL_URL ? 'Défini (masqué)' : 'Non défini');
  console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
  console.log('MYSQLHOST:', process.env.MYSQLHOST);
  console.log('MYSQLUSER:', process.env.MYSQLUSER);
  console.log('MYSQLPORT:', process.env.MYSQLPORT);
  console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'Défini (longueur: ' + process.env.MYSQLPASSWORD.length + ')' : 'Non défini');
  console.log('MYSQL_ROOT_PASSWORD:', process.env.MYSQL_ROOT_PASSWORD ? 'Défini (longueur: ' + process.env.MYSQL_ROOT_PASSWORD.length + ')' : 'Non défini');
  console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? 'Défini (masqué)' : 'Non défini');
  console.log('=== FIN DES VARIABLES RAILWAY ===\n');
}

// Exécuter la fonction de débogage au démarrage
debugRailwayVariables();

// Déterminer les paramètres de connexion en utilisant les variables Railway
const dbName = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'railway';
const dbUser = process.env.MYSQLUSER || 'root';
const dbHost = process.env.MYSQLHOST || 'mysql.railway.internal';
const dbPassword = process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD || '';
const dbPort = process.env.MYSQLPORT ? parseInt(process.env.MYSQLPORT, 10) : 3306;

// Afficher les paramètres de connexion qui seront utilisés
console.log('=== PARAMÈTRES DE CONNEXION À LA BASE DE DONNÉES ===');
console.log('Host:', dbHost);
console.log('Database:', dbName);
console.log('User:', dbUser);
console.log('Port:', dbPort);
console.log('Password défini:', dbPassword ? 'Oui (longueur: ' + dbPassword.length + ')' : 'Non');

// Déclarer la variable sequelize
let sequelize: Sequelize;

// Créer une instance Sequelize avec les paramètres Railway explicites
console.log('\n=== TENTATIVE DE CONNEXION AVEC LES PARAMÈTRES RAILWAY ===');

// Afficher les premiers caractères du mot de passe pour vérification
if (dbPassword) {
  console.log('Premiers caractères du mot de passe:', dbPassword.substring(0, 3) + '...');
}

sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: true, // Activer les logs SQL pour le débogage
  dialectOptions: {
    // Désactiver SSL pour le diagnostic initial
    ssl: null
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
    console.error(`- Host: ${dbHost}`);
    console.error(`- Database: ${dbName}`);
    console.error(`- Port: ${dbPort}`);
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
