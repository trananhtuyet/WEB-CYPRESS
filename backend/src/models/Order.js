const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Order",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "shipping",
          "delivered",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "pending",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "orders",
    }
  );

