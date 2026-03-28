const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

router.get("/", protect, admin, getNotifications);
router.put("/:id/read", protect, admin, markAsRead);
router.put("/read-all", protect, admin, markAllAsRead);

module.exports = router;
