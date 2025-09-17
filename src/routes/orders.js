import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Item from "../models/Item.js";

const router = express.Router();

// All order routes require login
router.use(authenticate);

/**
 * GET /orders/past
 * Show past orders for logged-in user
 */
router.get("/past", async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [{
              model: Item,
              attributes: ["id", "name", "category", "price", "imageUrl"]
            }]
        }],
      order: [["created", "DESC"]],
    });
    const formatted = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalPrice: order.totalPrice,
      created: order.created,
      items: order.OrderItems.map(oi => ({
        id: oi.Item.id,
        name: oi.Item.name,
        category: oi.Item.category,
        quantity: oi.quantity,
        unitPrice: oi.unitPrice,
        imageUrl: oi.Item.imageUrl
      }))
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch past orders failed:", err);
    res.status(500).json({ error: "Failed to fetch past orders" });
  }
});


/**
 * POST /orders/new
 * body: { items: [{ itemId, quantity }] }
 */
router.post("/new", async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "No items provided" });
  }

  // Validate items and calculate total
  let total = 0;
  for (const i of items) {
    const item = await Item.findByPk(i.itemId);
    if (!item) return res.status(404).json({ error: `Item ${i.itemId} not found` });
    if (item.quantity < i.quantity)
      return res.status(400).json({ error: `Not enough stock for ${item.name}` });
    total += item.price * i.quantity;
  }

  // Create order
  const order = await Order.create({ userId: req.user.id, totalPrice: total});

  for (const i of items) {
    const item = await Item.findByPk(i.itemId);
    await OrderItem.create({
      orderId: order.id,
      itemId: item.id,
      quantity: i.quantity,
      unitPrice: item.price, // record price at time of order
    });
    item.quantity -= i.quantity;
    await item.save();
  }

  res.json({ message: "Order created", orderId: order.id });
});

export default router;
