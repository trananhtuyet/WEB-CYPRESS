const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ContactThread",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("new", "replied", "closed"),
        allowNull: false,
        defaultValue: "new",
      },
    },
    {
      tableName: "contact_threads",
    }
  );
