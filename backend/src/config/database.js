const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length) {
  throw new Error(`Missing database environment variables: ${missingEnvVars.join(", ")}`);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    define: {
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = sequelize;
