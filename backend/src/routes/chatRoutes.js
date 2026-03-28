const router = require("express").Router();
const {
  sendMessage,
  getMessages,
  markAsRead,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/auth");

router.post("/", protect, sendMessage);
router.get("/:ticketId", protect, getMessages);
router.put("/:ticketId/read", protect, markAsRead);

module.exports = router;
