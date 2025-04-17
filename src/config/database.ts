import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

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

// Essayer de construire une URL de connexion directement à partir des variables MYSQL_* de Railway
if (process.env.MYSQL_ROOT_PASSWORD && process.env.NODE_ENV === 'production') {
  const directUrl = `mysql://root:${process.env.MYSQL_ROOT_PASSWORD}@mysql.railway.internal:3306/railway`;
  console.log('Constructed direct URL from MYSQL_ROOT_PASSWORD');
  
  sequelize = new Sequelize(directUrl, {
    dialect: 'mysql',
    logging: console.log, // Activer les logs SQL pour le débogage
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
}
// Si nous avons une URL de connexion (préféré pour Railway), utilisons-la
else if (useConnectionUrl) {
  console.log('Using connection URL for database:', connectionUrl.replace(/:[^:]*@/, ':****@')); // Masquer le mot de passe dans les logs
  
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: console.log, // Activer les logs SQL pour le débogage
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
} 
// Dernier recours: utiliser les paramètres individuels
else {
  console.log('Using individual connection parameters');
  // Utiliser MYSQL_ROOT_PASSWORD si disponible et que DB_PASSWORD n'est pas défini
  const password = dbPassword || process.env.MYSQL_ROOT_PASSWORD || '';
  console.log('Final password length:', password.length);
  
  sequelize = new Sequelize(dbName, dbUser, password, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: console.log, // Activer les logs SQL pour le débogage
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
}

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
