import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Prioritize direct connection URL for Railway
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

// Fallback to individual connection parameters if no URL is available
const dbName = process.env.DB_NAME || 'railway';
const dbUser = process.env.DB_USER || 'root';
const dbHost = process.env.DB_HOST || 'mysql.railway.internal';
const dbPassword = process.env.DB_PASSWORD || '';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

// Log connection details for debugging (without sensitive info)
console.log('=== DATABASE CONNECTION INFO ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Connection URL available:', connectionUrl ? 'Yes' : 'No');
console.log('Host:', dbHost);
console.log('Database:', dbName);
console.log('Port:', dbPort);

// Declare sequelize variable
let sequelize: Sequelize;

// If we have a connection URL (preferred for Railway), use it
if (connectionUrl) {
  console.log('Using connection URL for database');
  sequelize = new Sequelize(connectionUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // Important for Railway: disable SSL verification in production
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  console.log('Using individual connection parameters');
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
      } : false
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
