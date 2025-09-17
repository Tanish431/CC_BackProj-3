import { DataTypes } from "sequelize";
import sequelize from "../db.js";

const Item = sequelize.define("Item", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  price: { type: DataTypes.FLOAT, allowNull: false },
  imageUrl: DataTypes.STRING,
}, {
  timestamps: true,
  createdAt: "created",
  updatedAt: "restocked",
});

export default Item;
