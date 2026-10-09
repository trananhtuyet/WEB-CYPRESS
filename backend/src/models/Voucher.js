const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Voucher",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "percent",
      },
      value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      min_order_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      used_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      starts_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ends_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "vouchers",
    }
  );
