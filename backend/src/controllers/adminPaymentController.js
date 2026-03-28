const Order = require("../models/Order");

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const transactions = await Order.find(filter)
      .populate("user", "name email")
      .select(
        "user totalPrice status paymentMethod vnpayTransactionId paidAt refundReason refundedAt createdAt",
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      transactions,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    if (!["paid", "completed"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Chỉ hoàn tiền đơn đã thanh toán" });
    }
    order.status = "refunded";
    order.refundReason = req.body.reason || "";
    order.refundedAt = new Date();
    await order.save();
    res.json({ message: "Đã hoàn tiền đơn hàng", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
