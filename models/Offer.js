const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Offer = sequelize.define(
  "Offer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    offerId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
      index: true,
    },
    paymentInstrument: {
      type: DataTypes.STRING,
      allowNull: true,
      index: true,
      comment: "CREDIT, EMI_OPTIONS, etc.",
    },
    minAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discountType: {
      type: DataTypes.ENUM("FLAT", "PERCENTAGE"),
      allowNull: false,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "For FLAT discount type",
    },
    discountPercent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "For PERCENTAGE discount type",
    },
    maxDiscount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Maximum discount cap for PERCENTAGE type",
    },
    validFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    validTo: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      index: true,
    },
  },
  {
    indexes: [
      {
        fields: ["bankName", "paymentInstrument"],
      },
      {
        fields: ["discountType"],
      },
      {
        fields: ["minAmount"],
      },
    ],
  }
);

module.exports = Offer;
