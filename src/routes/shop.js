import express from "express";
import { Op } from "sequelize";
import Item from "../models/Item.js";
import fuzzysort from "fuzzysort"; 

const router = express.Router();

router.get("/list", async (req, res) => {
  const { search, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

  try {
    const where = {};
    // Apply filters
    if (category) where.category = category;
    if (minPrice && maxPrice) where.price = { [Op.between]: [minPrice, maxPrice] };
    else if (minPrice) where.price = { [Op.gte]: minPrice };
    else if (maxPrice) where.price = { [Op.lte]: maxPrice };

    let items = await Item.findAll({ where });
    // Fuzzy search
    if (search) {
      // First search by name
      const results = fuzzysort.go(search, items, { key: ["name"] });
      if (results.total === 0) {
        // Second search by description
        const results = fuzzysort.go(search, items, { key: ["description"] });
        items = results.map(r => r.obj);
      }else{
        items = results.map(r => r.obj);
      } 
    }
    // Pagination
    const total = items.length;
    const start = (page - 1) * limit;
    const end = start + parseInt(limit);
    const paginated = items.slice(start, end);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      data: paginated,
    });
  } catch (err) {
    console.error("Shop list failed:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

export default router;
