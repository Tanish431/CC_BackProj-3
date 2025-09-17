import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import express from "express";
import path from "path";
import { Op } from "sequelize";

import { authenticate } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import Item from "../models/Item.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Protect all routes: only admin
router.use(authenticate, requireRole("admin"));

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = path.resolve(req.file.path);
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", async () => {
        try {
          for (const row of results) {
            await Item.create({
              name: row.name,
              description: row.description || "",
              category: row.category || "",
              quantity: parseInt(row.quantity) || 0,
              price: parseFloat(row.price) || 0,
              imageUrl: row.imageUrl || null,
            });
          }

          fs.unlinkSync(filePath);
          res.json({ message: "CSV uploaded successfully", inserted: results.length });
        } catch (dbErr) {
          res.status(500).json({ error: "Database insert failed", details: dbErr.message });
        }
      })
      .on("error", (parseErr) => {
        res.status(500).json({ error: "CSV parsing failed", details: parseErr.message });
      });

  } catch (err) {
    res.status(500).json({ error: "CSV upload failed", details: err.message });
  }
});


// GET /inventory/list
router.get("/list", async (req, res) => {
  const items = await Item.findAll({
    attributes: ["id", "name", "description", "quantity", "category", "price", "imageUrl", "created", "restocked"],
  });
  res.json(items);
});

// POST /inventory/new
router.post("/new", async (req, res) => {
  const { name, description, category, quantity, price } = req.body;
  const item = await Item.create({ name, description, category, quantity, price });
  res.json(item);
});

// PUT /inventory/update/:id
router.put("/update/:id", async (req, res) => {
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  await item.update(req.body);
  res.json(item);
});

// POST /inventory/restock/:id
router.post("/restock/:id", async (req, res) => {
  const { quantity } = req.body; // new stock
  const item = await Item.findByPk(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  item.quantity += quantity;
  await item.save();
  res.json(item);
});

/**
 * GET /inventory/low-stock
 * Returns items where quantity <= 2
 */
router.get("/low-stock", async (req, res) => {
  try {
    const items = await Item.findAll({ where: { quantity: { [Op.lte]: 2 } } });
    if (items.length === 0) {
      return res.json({ message: "All items sufficiently stocked" });
    }
    res.json({ alert: "Low stock detected", items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check stock" });
  }
});


// GET /inventory/orders
router.get("/orders", async (req, res) => {
  const { 
    itemName, 
    category, 
    minTotal, 
    maxTotal, 
    user, 
    page = 1, 
    limit = 10 
  } = req.query;

  const whereOrder = {};
  const whereItem = {};
  const whereUser = {};

  if (minTotal && maxTotal) whereOrder.totalPrice = { [Op.between]: [minTotal, maxTotal] };
  else if (minTotal) whereOrder.totalPrice = { [Op.gte]: minTotal };
  else if (maxTotal) whereOrder.totalPrice = { [Op.lte]: maxTotal };

  if (itemName) whereItem.name = { [Op.like]: `%${itemName}%` };
  if (category) whereItem.category = category;

  if (user) whereUser.username = user;

  try {
    const orders = await Order.findAndCountAll({
      where: whereOrder,
      include: [
        { model: User, where: whereUser, attributes: ["username"] },
        { model: OrderItem, include: [{ model: Item, where: whereItem }] }
      ],
      order: [["created", "DESC"]],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      distinct: true,
    });

    res.json({
      total: orders.count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(orders.count / limit),
      data: orders.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});


// GET /inventory/revenue
router.get("/revenue", async (req, res) => {
  const orders = await Order.findAll({ include: [{ model: OrderItem }] });
  let revenue = 0;
  orders.forEach(order => {
    order.OrderItems.forEach(oitem => {
      revenue += oitem.unitPrice * oitem.quantity;
    });
  });
  res.json({ totalRevenue: revenue });
});

export default router;
