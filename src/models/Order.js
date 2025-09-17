import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  totalPrice: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: "created" },
}, {
  timestamps: true,
  createdAt: "created",  
  updatedAt: false       
});

// Relations
Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

export default Order;
