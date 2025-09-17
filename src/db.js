import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_PATH || "./database.sqlite",
  logging: false
});

export default sequelize;
