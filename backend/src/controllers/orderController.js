const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const sendEmail = require("../services/emailService");
const { createNotification } = require("./notificationController");
const {
  createPaymentUrl,
  verifyReturnUrl,
} = require("../services/vnpayService");

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống" });
    }
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      productName: item.product.name,
      variant: item.variant,
      price: item.variant.price * item.quantity,
    }));
    const totalPrice = orderItems.reduce((sum, item) => sum + item.price, 0);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      totalPrice,
    });

    const paymentUrl = createPaymentUrl(req, order);

    cart.items = [];
    await cart.save();

    res.status(201).json({ order, paymentUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const isValid = verifyReturnUrl(vnpParams);
    const orderId = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;

    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.json({ success: false, message: "Mã đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Đơn hàng không tồn tại" });
    }

    if (isValid && responseCode === "00") {
      order.status = "paid";
      order.paidAt = new Date();
      order.vnpayTransactionId = req.query.vnp_TransactionNo || "";
      await order.save();

      const user = await User.findById(order.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "Xác nhận thanh toán thành công",
          html: `<h3>Đơn hàng #${order._id} đã thanh toán thành công!</h3><p>Tổng tiền: ${order.totalPrice.toLocaleString()} VND</p><p>Chúng tôi sẽ xử lý đơn hàng sớm nhất.</p>`,
        });
      }
      await createNotification({
        type: "order_paid",
        title: "Đơn hàng mới đã thanh toán",
        message: `Đơn hàng #${order._id} - ${order.totalPrice.toLocaleString()} VND`,
        relatedId: order._id,
        relatedModel: "Order",
      });
      res.json({ success: true, order });
    } else {
      order.status = "failed";
      await order.save();
      res.json({ success: false, message: "Thanh toán thất bại" });
    }
  } catch (error) {
    console.error("vnpayReturn error:", error.message);
    res.json({ success: false, message: "Xác minh thanh toán thất bại" });
  }
};

exports.vnpayIPN = async (req, res) => {
  try {
    const vnpParams = { ...req.query };
    const isValid = verifyReturnUrl(vnpParams);
    if (!isValid) {
      return res.json({ RspCode: "97", Message: "Invalid signature" });
    }
    const orderId = req.query.vnp_TxnRef;
    const responseCode = req.query.vnp_ResponseCode;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ RspCode: "01", Message: "Order not found" });
    }
    if (order.status !== "pending") {
      return res.json({ RspCode: "02", Message: "Order already processed" });
    }
    if (responseCode === "00") {
      order.status = "paid";
      order.paidAt = new Date();
      order.vnpayTransactionId = req.query.vnp_TransactionNo || "";
      await order.save();
      await createNotification({
        type: "order_paid",
        title: "Đơn hàng mới đã thanh toán (IPN)",
        message: `Đơn hàng #${order._id} - ${order.totalPrice.toLocaleString()} VND`,
        relatedId: order._id,
        relatedModel: "Order",
      });
      const user = await User.findById(order.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "Xác nhận thanh toán thành công",
          html: `<h3>Đơn hàng #${order._id} đã thanh toán thành công!</h3><p>Tổng tiền: ${order.totalPrice.toLocaleString()} VND</p>`,
        });
      }
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    } else {
      order.status = "failed";
      await order.save();
      return res.json({ RspCode: "00", Message: "Confirm Success" });
    }
  } catch (error) {
    return res.json({ RspCode: "99", Message: "Unknown error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderItems.product",
      "name images slug",
    );
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      orders,
      page: Number(page),
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Đơn hàng không tồn tại" });
    }
    if (req.body.status) order.status = req.body.status;
    if (req.body.note) order.note = req.body.note;
    if (req.file) {
      order.deliveryFile = `/uploads/delivery/${req.file.filename}`;
    }
    if (req.body.status === "completed") {
      order.completedAt = new Date();
      const user = await User.findById(order.user);
      if (user) {
        await sendEmail({
          to: user.email,
          subject: "Đơn hàng đã hoàn thành",
          html: `<h3>Đơn hàng #${order._id} đã hoàn thành!</h3><p>Bạn có thể tải file sản phẩm trong chi tiết đơn hàng.</p>`,
        });
      }
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
