import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Support for Railway's MySQL environment variables
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE_DATABASE || 'dbz_db';
const dbUser = process.env.DB_USER || process.env.MYSQLDATABASE_USERNAME || 'root';
const dbHost = process.env.DB_HOST || process.env.MYSQLDATABASE_HOST || 'localhost';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLDATABASE_PASSWORD || '';
const dbPort = process.env.DB_PORT || process.env.MYSQLDATABASE_PORT ? parseInt(process.env.DB_PORT || process.env.MYSQLDATABASE_PORT || '3306', 10) : 3306;

// Log database connection info (without sensitive data)
console.log(`Attempting to connect to database: ${dbName} on host: ${dbHost}:${dbPort}`);

// Log environment for debugging
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Available MySQL env vars:', {
  MYSQL_URL: process.env.MYSQL_URL ? 'Set' : 'Not set',
  MYSQL_PUBLIC_URL: process.env.MYSQL_PUBLIC_URL ? 'Set' : 'Not set',
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
  DB_HOST: dbHost,
  DB_NAME: dbName,
  DB_PORT: dbPort
});

// Declare sequelize variable
let sequelize: Sequelize;

// Check if we have a full connection URL from Railway
if (process.env.MYSQL_URL && process.env.NODE_ENV === 'production') {
  console.log('Using MYSQL_URL for database connection');
  // Create Sequelize instance using connection URL
  sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true
      }
    }
  });
} else {
  console.log('Using individual connection parameters');
  // Create Sequelize instance using individual parameters
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
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
