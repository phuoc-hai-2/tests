const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getTransactions,
  refundOrder,
} = require("../controllers/adminPaymentController");

router.get("/", protect, admin, getTransactions);
router.put("/:id/refund", protect, admin, refundOrder);

module.exports = router;
