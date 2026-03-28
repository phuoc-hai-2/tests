const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getStats,
  getRevenueChart,
  getUserGrowth,
  getTopProducts,
} = require("../controllers/adminDashboardController");

router.get("/stats", protect, admin, getStats);
router.get("/revenue-chart", protect, admin, getRevenueChart);
router.get("/user-growth", protect, admin, getUserGrowth);
router.get("/top-products", protect, admin, getTopProducts);

module.exports = router;
