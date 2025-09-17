import { DataTypes } from "sequelize";
import sequelize from "../db.js";
import Order from "./Order.js";
import Item from "./Item.js";

const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false },
}, { timestamps: false });

OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Order.hasMany(OrderItem, { foreignKey: "orderId" });

OrderItem.belongsTo(Item, { foreignKey: "itemId" });
Item.hasMany(OrderItem, { foreignKey: "itemId" });

export default OrderItem;
