import bcrypt from "bcrypt";
import dotenv from "dotenv";
import sequelize from "./db.js";
import User from "./models/User.js";
dotenv.config();

async function seed() {
  await sequelize.sync({ force: true });
  // Create an admin user
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await User.create({
    username: process.env.ADMIN_USERNAME,
    passwordHash: hash,
    role: "admin",
  });
  console.log("Database seeded with admin user");
  process.exit();
}

seed();
