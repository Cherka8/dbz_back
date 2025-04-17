import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Interface pour les attributs de l'utilisateur (pour la création)
interface UserAttributes {
  id: number;
  username: string;
  email: string;
  password?: string; // Rendre le mot de passe optionnel ici car il sera haché
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la création d'utilisateur (rend 'id' optionnel car auto-généré)
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Définition du modèle User
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialisation du modèle avec Sequelize
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Validation de base pour le format email
      },
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
  },
  {
    tableName: 'users', // Nom exact de la table dans la BDD
    sequelize, // Instance de connexion Sequelize
    timestamps: true, // Gère automatiquement createdAt et updatedAt
    underscored: false, // Si vous préférez les noms en snake_case, mettez true
  }
);

export default User;
