const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    variant: {
      name: String,
      price: Number,
      duration: Number,
    },
    price: { type: Number, required: true },
  },
  { _id: true },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    paymentMethod: { type: String, default: "vnpay" },
    status: {
      type: String,
      enum: ['pending', 'paid', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    refundReason: { type: String, default: '' },
    refundedAt: Date,
    vnpayTransactionId: { type: String, default: "" },
    deliveryFile: { type: String, default: "" },
    paidAt: Date,
    completedAt: Date,
    note: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
