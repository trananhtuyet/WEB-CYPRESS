const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ContactMessage",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      contact_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sender: {
        type: DataTypes.ENUM("customer", "admin"),
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "contact_messages",
    }
  );
