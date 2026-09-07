// =========================
// STORE SETTINGS MODEL
// =========================

const mongoose = require("mongoose");

// Settings are a single document. `key` keeps it that way: every read and write
// targets the document with key "store".

const SETTINGS_KEY = "store";

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: SETTINGS_KEY,
      unique: true,
    },

    storeName: {
      type: String,
      trim: true,
      default: "Favour Store",
    },

    storeAddress: {
      type: String,
      trim: true,
      default: "",
    },

    storePhone: {
      type: String,
      trim: true,
      default: "",
    },

    receiptFooter: {
      type: String,
      trim: true,
      default: "Thank you for shopping with us!",
    },

    lowStockAlert: {
      type: Number,
      min: [0, "Low stock alert cannot be negative."],
      default: 5,
    },

    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

settingSchema.set("toJSON", {
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.key;

    return ret;
  },
});

module.exports = mongoose.model("Setting", settingSchema);
module.exports.SETTINGS_KEY = SETTINGS_KEY;
