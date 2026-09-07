// =========================
// SALE MODEL
// =========================

const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    receiptNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Human readable stamp shown on the printed receipt.
    dateTime: {
      type: String,
      default: "",
    },

    items: {
      type: [saleItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "A sale must contain at least one item.",
      },
    },

    subtotal: { type: Number, required: true, min: 0 },

    discount: { type: Number, default: 0, min: 0 },

    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

saleSchema.index({ date: -1 });

saleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();

    delete ret._id;

    return ret;
  },
});

module.exports = mongoose.model("Sale", saleSchema);
