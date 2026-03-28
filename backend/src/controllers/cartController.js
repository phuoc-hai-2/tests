const Cart = require("../models/Cart");

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name images slug",
    );
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { productId, variant, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant._id.toString() === variant._id,
    );
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, variant, quantity });
    }
    await cart.save();
    cart = await Cart.findById(cart._id).populate(
      "items.product",
      "name images slug",
    );
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    const item = cart.items.id(req.params.itemId);
    if (!item)
      return res
        .status(404)
        .json({ message: "Sản phẩm không có trong giỏ hàng" });
    item.quantity = quantity;
    await cart.save();
    const updated = await Cart.findById(cart._id).populate(
      "items.product",
      "name images slug",
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart)
      return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );
    await cart.save();
    const updated = await Cart.findById(cart._id).populate(
      "items.product",
      "name images slug",
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: "Đã xóa giỏ hàng" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
