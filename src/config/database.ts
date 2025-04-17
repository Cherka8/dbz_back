import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

if (!dbName || !dbUser || !dbHost) {
  console.error(
    'Database configuration error: DB_NAME, DB_USER, and DB_HOST must be set in the .env file.'
  );
  process.exit(1);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // Set to console.log to see SQL queries
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('💾[database]: Connection has been established successfully.');
    // In development, you might want to sync database schema
    // await sequelize.sync({ alter: true }); // Use with caution in production!
    // console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error('❌[database]: Unable to connect to the database:', error);
    process.exit(1); // Exit the process if DB connection fails
  }
};

export default sequelize;
