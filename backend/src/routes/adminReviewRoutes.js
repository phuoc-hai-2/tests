const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getAllReviews,
  toggleHideReview,
  adminDeleteReview,
  replyReview,
} = require("../controllers/adminReviewController");

router.get("/", protect, admin, getAllReviews);
router.put("/:id/toggle-hide", protect, admin, toggleHideReview);
router.delete("/:id", protect, admin, adminDeleteReview);
router.put("/:id/reply", protect, admin, replyReview);

module.exports = router;
