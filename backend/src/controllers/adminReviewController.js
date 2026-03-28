const Review = require('../models/Review');

exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, isHidden, productId } = req.query;
    const filter = {};
    if (isHidden !== undefined) filter.isHidden = isHidden === 'true';
    if (productId) filter.product = productId;

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ reviews, page: Number(page), pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleHideReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });
    review.isHidden = !review.isHidden;
    await review.save();
    res.json({ message: review.isHidden ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá', review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });
    const productId = review.product;
    await review.deleteOne();

    const Product = require('../models/Product');
    const reviews = await Review.find({ product: productId });
    const numReviews = reviews.length;
    const averageRating = numReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews
      : 0;
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(averageRating * 10) / 10,
      numReviews
    });

    res.json({ message: 'Đã xóa đánh giá' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Đánh giá không tồn tại' });
    review.adminReply = req.body.reply;
    review.adminRepliedAt = new Date();
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
