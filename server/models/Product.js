// =========================
// PRODUCT MODEL
// =========================

const mongoose = require("mongoose");

const CATEGORIES = ["Food", "Drinks", "Toiletries", "Household", "Others"];

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required."],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Product price is required."],
      min: [0, "Price cannot be negative."],
    },

    // Barcodes are optional, but must be unique when present.
    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      enum: {
        values: CATEGORIES,
        message: "{VALUE} is not a valid category.",
      },
      default: "Others",
    },

    stock: {
      type: Number,
      required: [true, "Stock quantity is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
    },
  },
  { timestamps: true },
);

// Partial index: several products may have no barcode, but a barcode that is
// present may only belong to one product.
productSchema.index(
  { barcode: 1 },
  {
    unique: true,
    partialFilterExpression: { barcode: { $type: "string", $gt: "" } },
  },
);

// The front end works with { id, name, price, barcode, category, stock }.
productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;

    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
module.exports.CATEGORIES = CATEGORIES;
