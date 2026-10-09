const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PaymentTransaction",
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
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gateway: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transaction_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      gateway_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "processing", "paid", "failed", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      items_snapshot: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      checkout_payload: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      gateway_response: {
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "payment_transactions",
    }
  );
