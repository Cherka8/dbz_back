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
// Configuration CORS avec options spécifiques
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Pour le développement local
    'https://dbz-battle-game-2025.windsurf.build',  // URL principale de Netlify
    'https://680111b971b0d100a86f7772--dbz-battle-game-2025-4y5td.netlify.app',  // URL de déploiement spécifique
    'https://dbz-battle-game-2025-4y5td.netlify.app'  // URL de domaine personnalisé potentiel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions)); // Enable CORS with specific options
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
