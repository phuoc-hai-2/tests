const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const averageRating =
    numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(averageRating * 10) / 10,
    numReviews,
  });
};

exports.createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: "completed",
      "orderItems.product": productId,
    });
    if (!order) {
      return res.status(400).json({
        message: "Bạn chỉ có thể đánh giá sản phẩm đã mua thành công",
      });
    }
    const existing = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Bạn đã đánh giá sản phẩm này cho đơn hàng này" });
    }
    const images = req.files
      ? req.files.map((f) => `/uploads/reviews/${f.filename}`)
      : [];
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      order: orderId,
      rating: Number(rating),
      comment,
      images,
    });
    await updateProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      isHidden: { $ne: true },
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền chỉnh sửa" });
    }
    if (req.body.rating) review.rating = Number(req.body.rating);
    if (req.body.comment !== undefined) review.comment = req.body.comment;
    if (req.files && req.files.length > 0) {
      review.images = req.files.map((f) => `/uploads/reviews/${f.filename}`);
    }
    await review.save();
    await updateProductRating(review.product);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ message: "Đánh giá không tồn tại" });
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }
    const productId = review.product;
    await review.deleteOne();
    await updateProductRating(productId);
    res.json({ message: "Đã xóa đánh giá" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
