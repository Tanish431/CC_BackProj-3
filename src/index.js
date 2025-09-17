import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import sequelize from "./db.js";
import passport from "./passport.js";

import authRoutes from "./routes/auth.js";
import inventoryRoutes from "./routes/inventory.js";
import shopRoutes from "./routes/shop.js";
import orderRoutes from "./routes/orders.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/shop", shopRoutes);
app.use("/orders", orderRoutes);
app.use("/cart", cartRoutes);

const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
