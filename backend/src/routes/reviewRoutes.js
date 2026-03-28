const router = require("express").Router();
const {
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const { protect } = require("../middlewares/auth");
const createUploader = require("../middlewares/upload");

const upload = createUploader("reviews");

router.post("/", protect, upload.array("images", 5), createReview);
router.get("/product/:productId", getProductReviews);
router.put("/:id", protect, upload.array("images", 5), updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
