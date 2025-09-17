import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import CartItem from "../models/CartItem.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import sequelize from "../db.js";

const router = express.Router();
router.use(authenticate);

//Adding items to cart
router.post("/add", async (req, res) => {
  const { itemId, quantity } = req.body;
  if (!itemId || !quantity) return res.status(400).json({ error: "Missing fields" });

  const item = await Item.findByPk(itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  // Check if already in cart
  let cartItem = await CartItem.findOne({ where: { userId: req.user.id, itemId } });
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    cartItem = await CartItem.create({
      userId: req.user.id,
      itemId,
      quantity
    });
  }
  res.json(cartItem);
});

// Get cart info
router.get("/info", async (req, res) => {
  const cartItems = await CartItem.findAll({
    where: { userId: req.user.id },
    include: [Item], // Include item details
  });

  const total = cartItems.reduce((sum, ci) => sum + ci.Item.price* ci.quantity, 0);

  res.json({ items: cartItems, total });
});

// Remove item from cart
router.post("/remove", async (req, res) => {
  const { itemId } = req.body;
  const cartItem = await CartItem.findOne({ where: { userId: req.user.id, itemId } });
  if (!cartItem) return res.status(404).json({ error: "Not in cart" });
  await cartItem.destroy(); 
  res.json({ message: "Removed from cart" });
});

// Checkout
router.post("/checkout", async (req, res) => {
  const cartItems = await CartItem.findAll({ where: { userId: req.user.id }, include: [Item] });
  if (!cartItems.length) return res.status(400).json({ error: "Cart is empty" });

  const t = await sequelize.transaction();
  try {
    // Check stock
    for (const ci of cartItems) {
      if (ci.quantity > ci.Item.quantity) {
        throw new Error(`Not enough stock for ${ci.Item.name}`);
      }
    }

    // Create order
    const total = cartItems.reduce((sum, ci) => sum + ci.Item.price * ci.quantity, 0);
    const order = await Order.create({ userId: req.user.id, totalPrice: total }, { transaction: t });

    // Create order items & reduce stock
    for (const ci of cartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          itemId: ci.itemId,
          quantity: ci.quantity,
          unitPrice: ci.Item.price,
        },
        { transaction: t }
      );

      ci.Item.quantity -= ci.quantity;
      await ci.Item.save({ transaction: t });
    }

    // Clear cart
    await CartItem.destroy({ where: { userId: req.user.id }, transaction: t });

    await t.commit();
    res.json({ message: "Order placed", orderId: order.id });
  } catch (err) {
    await t.rollback(); // Rollback on error
    res.status(400).json({ error: err.message });
  }
});

export default router;
