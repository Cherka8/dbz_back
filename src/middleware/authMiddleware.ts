import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import getJwtSecret from '../config/jwtConfig'; // Importer la fonction centralisée

// Interface pour étendre l'objet Request d'Express et y ajouter la propriété 'user'
export interface AuthRequest extends Request {
  user?: { id: string }; // ou un type plus spécifique pour votre utilisateur si nécessaire
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    // Vérifier si l'en-tête Authorization existe et commence par 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extraire le token (enlever 'Bearer ')
            token = req.headers.authorization.split(' ')[1];

            // Vérifier le token avec la clé secrète
            const decoded = jwt.verify(token, getJwtSecret()) as { user: { id: string } }; // Utiliser la fonction centralisée

            // Attacher l'utilisateur décodé à l'objet req
            // Important: On pourrait vouloir récupérer l'utilisateur complet de la BDD ici
            // pour s'assurer qu'il existe toujours, mais pour l'instant on garde l'ID du token.
            req.user = decoded.user; 

            next(); // Passer au prochain middleware/route
        } catch (error) {
            console.error('Erreur de vérification du token:', error);
            res.status(401).json({ message: 'Non autorisé, token invalide.' });
        }
    } 

    // Si aucun token n'est trouvé dans l'en-tête
    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token fourni.' });
    }
};
