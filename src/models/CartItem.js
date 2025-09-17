import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import User from "./User.js";
import Item from "./Item.js";

const CartItem = sequelize.define("CartItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false }
});

CartItem.belongsTo(User, { foreignKey: "userId" });
User.hasMany(CartItem, { foreignKey: "userId" });

CartItem.belongsTo(Item, { foreignKey: "itemId" });
Item.hasMany(CartItem, { foreignKey: "itemId" });

export default CartItem;
