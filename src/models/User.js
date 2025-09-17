import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("user","admin"), defaultValue: "user" }
}, { timestamps: false });

export default User;
