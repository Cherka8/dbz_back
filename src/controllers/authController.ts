import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import { Op } from 'sequelize';
import dotenv from 'dotenv'; // Import dotenv to access environment variables
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware'; // Import AuthRequest

dotenv.config(); // Load environment variables from .env file

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1); // Exit if JWT_SECRET is not set
}

// --- Contrôleur pour l'inscription ---
export const register: RequestHandler = async (req, res) => {
    const { username, email, password } = req.body;

    // Validation simple (on pourrait ajouter plus de validations ici)
    if (!username || !email || !password) {
        res.status(400).json({ message: 'Veuillez fournir un nom d\'utilisateur, un email et un mot de passe.' });
        return;
    }

    if (password.length < 6) { // Exemple de validation supplémentaire
         res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
         return;
    }

    try {
        // 1. Vérifier si l'utilisateur existe déjà (par email OU nom d'utilisateur)
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [{ email: email }, { username: username }]
            }
        });

        if (existingUser) {
            // Conflit : la ressource existe déjà
            res.status(409).json({ message: 'L\'email ou le nom d\'utilisateur existe déjà.' });
            return;
        }

        // 2. Hacher le mot de passe
        const salt = await bcrypt.genSalt(10); // Générer le "sel"
        const hashedPassword = await bcrypt.hash(password, salt); // Hacher le mot de passe

        // 3. Créer le nouvel utilisateur dans la BDD
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword, // Stocker le mot de passe haché
        });

        // 4. Préparer la réponse (SANS le mot de passe)
        const userResponse = {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
        };

        // Succès : Ressource créée
        res.status(201).json({ message: 'Utilisateur enregistré avec succès.', user: userResponse });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        // On pourrait ajouter une gestion plus fine des erreurs Sequelize ici
        res.status(500).json({ message: 'Erreur interne du serveur lors de l\'inscription.' });
    }
};

// --- Contrôleur pour la connexion ---
export const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body; // Ou utiliser username si vous préférez

    // 1. Validation des entrées
    if (!email || !password) {
        res.status(400).json({ message: 'Veuillez fournir un email et un mot de passe.' });
        return;
    }

    try {
        // 2. Trouver l'utilisateur par email
        const user = await User.findOne({ where: { email } });

        // 3. Vérifier si l'utilisateur existe
        if (!user) {
            // Important: Ne pas dire si c'est l'email ou le mdp qui est faux pour la sécurité
            res.status(401).json({ message: 'Identifiants invalides.' });
            return;
        }

        // 4. Comparer le mot de passe fourni avec le hash stocké
        const isMatch = await bcrypt.compare(password, user.password);

        // 5. Vérifier si les mots de passe correspondent
        if (!isMatch) {
            res.status(401).json({ message: 'Identifiants invalides.' });
            return;
        }

        // 6. Générer le JWT si les identifiants sont corrects
        const payload = {
            user: {
                id: user.id, // Inclure l'ID utilisateur dans le payload
                // Vous pouvez ajouter d'autres infos non sensibles ici si nécessaire (ex: username)
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET, // Utiliser la clé secrète chargée depuis .env
            { expiresIn: '1h' }, // Le token expirera dans 1 heure (vous pouvez ajuster)
            (err, token) => {
                if (err) throw err; // Gérer l'erreur de signature
                // 7. Renvoyer le token au client
                res.status(200).json({ 
                    message: 'Connexion réussie.',
                    token // Envoyer le token généré
                });
            }
        );

    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors de la connexion.' });
    }
};

// --- Contrôleur pour obtenir les infos de l'utilisateur connecté (via token) ---
export const getMe: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    // Le middleware 'protect' aura déjà vérifié le token et attaché 'req.user'
    // Nous nous assurons que req.user existe avant de l'utiliser
    if (!req.user) {
        // Normalement, le middleware 'protect' devrait empêcher d'arriver ici
        res.status(401).json({ message: 'Non autorisé. Aucun utilisateur associé au token.' });
        return;
    }

    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] } // Exclure le mot de passe
        });

        if (!user) {
            // Cela peut arriver si l'utilisateur a été supprimé après la création du token
            res.status(404).json({ message: 'Utilisateur associé au token non trouvé.' });
            return;
        }

        // Renvoyer les informations utilisateur dans un objet 'user'
        res.status(200).json({ user }); 

    } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur (getMe):', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};
