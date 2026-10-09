const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "StyleChatHistory",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      session_key: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "fallback",
      },
      history_payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "style_chat_histories",
    }
  );
