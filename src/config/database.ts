import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Fonction de débogage pour afficher toutes les variables d'environnement pertinentes
function debugEnvironmentVariables() {
  console.log('\n=== DETAILED ENVIRONMENT VARIABLES DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_PASSWORD exists:', process.env.DB_PASSWORD ? 'Yes (length: ' + process.env.DB_PASSWORD.length + ')' : 'No');
  console.log('MYSQL_URL exists:', process.env.MYSQL_URL ? 'Yes (length: ' + process.env.MYSQL_URL.length + ')' : 'No');
  console.log('DATABASE_URL exists:', process.env.DATABASE_URL ? 'Yes (length: ' + process.env.DATABASE_URL.length + ')' : 'No');
  console.log('MYSQL_ROOT_PASSWORD exists:', process.env.MYSQL_ROOT_PASSWORD ? 'Yes (length: ' + process.env.MYSQL_ROOT_PASSWORD.length + ')' : 'No');
  
  // Afficher toutes les variables d'environnement pour voir s'il y a quelque chose d'utile
  console.log('\n=== ALL ENVIRONMENT VARIABLES (NAMES ONLY) ===');
  Object.keys(process.env).forEach(key => {
    console.log(key);
  });
  console.log('=== END ENVIRONMENT VARIABLES ===\n');
}

// Exécuter la fonction de débogage au démarrage
debugEnvironmentVariables();

// Determine the connection method
let useConnectionUrl = false;
let connectionUrl = '';

// Check if we have MYSQL_URL available (preferred for Railway)
if (process.env.MYSQL_URL) {
  useConnectionUrl = true;
  connectionUrl = process.env.MYSQL_URL;
  console.log('MYSQL_URL is available, will use direct connection URL');
} else if (process.env.DATABASE_URL) {
  useConnectionUrl = true;
  connectionUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL is available, will use direct connection URL');
}

// Fallback to individual connection parameters if no URL is available
const dbName = process.env.DB_NAME || 'railway';
const dbUser = process.env.DB_USER || 'root';
const dbHost = process.env.DB_HOST || 'mysql.railway.internal';
const dbPassword = process.env.DB_PASSWORD || '';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Log connection details for debugging (without sensitive info)
console.log('=== DATABASE CONNECTION INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Using connection URL:', useConnectionUrl ? 'Yes' : 'No');
console.log('Host:', dbHost);
console.log('Database:', dbName);
console.log('Port:', dbPort);
console.log('Password defined:', dbPassword ? 'Yes (length: ' + dbPassword.length + ')' : 'No');
console.log('MYSQL_URL defined:', process.env.MYSQL_URL ? 'Yes' : 'No');
console.log('MYSQL_ROOT_PASSWORD defined:', process.env.MYSQL_ROOT_PASSWORD ? 'Yes' : 'No');

// Declare sequelize variable
let sequelize: Sequelize;

// Débogage des paramètres de connexion
console.log('\n=== CONNECTION PARAMETERS DEBUG ===');
console.log('MYSQL_URL value (masked):', process.env.MYSQL_URL ? process.env.MYSQL_URL.replace(/:[^:]*@/, ':****@') : 'Not defined');

// Essayer une approche simple et directe avec les paramètres individuels
console.log('\n=== TRYING DIRECT CONNECTION WITH INDIVIDUAL PARAMETERS ===');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD exists:', process.env.DB_PASSWORD ? 'Yes (length: ' + process.env.DB_PASSWORD.length + ')' : 'No');

const password = process.env.DB_PASSWORD || '';
console.log('Password being used (first 3 chars):', password.substring(0, 3) + '...');

// Créer une instance Sequelize avec les paramètres individuels explicites
sequelize = new Sequelize(dbName, dbUser, password, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: console.log, // Activer les logs SQL pour le débogage
  dialectOptions: {
    // Désactiver SSL pour le diagnostic
    ssl: null
  }
});

// Ajouter un gestionnaire d'erreur spécifique pour le diagnostic
process.on('unhandledRejection', (reason, promise) => {
  console.log('\n=== UNHANDLED REJECTION ===');
  console.log('Reason:', reason);
  // Ne pas quitter le processus pour permettre la poursuite de l'exécution
});

// Ajouter un log pour indiquer la fin de la configuration
console.log('\n=== DATABASE CONFIGURATION COMPLETE ===');

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('💾[database]: Connection has been established successfully.');
    
    // Sync database schema in development environment
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log("All models were synchronized successfully.");
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
