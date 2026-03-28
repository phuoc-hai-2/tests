const router = require("express").Router();
const {
  createOrder,
  vnpayReturn,
  vnpayIPN,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middlewares/auth");
const createUploader = require("../middlewares/upload");

const upload = createUploader("delivery");

router.post("/", protect, createOrder);
router.get("/vnpay-return", vnpayReturn);
router.get("/vnpay-ipn", vnpayIPN);
router.get("/my-orders", protect, getMyOrders);
router.get("/all", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put(
  "/:id/status",
  protect,
  admin,
  upload.single("deliveryFile"),
  updateOrderStatus,
);

module.exports = router;
