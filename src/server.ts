import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes'; // Import auth routes

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// API Routes
app.use('/api/auth', authRoutes); // Use auth routes with '/api/auth' prefix

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
