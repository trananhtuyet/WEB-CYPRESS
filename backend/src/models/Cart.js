const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
    },
    {
      tableName: "carts",
    }
  );

