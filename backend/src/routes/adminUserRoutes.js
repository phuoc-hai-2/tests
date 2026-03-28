const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getUsers,
  getUserDetail,
  toggleBanUser,
} = require("../controllers/adminUserController");

router.get("/", protect, admin, getUsers);
router.get("/:id", protect, admin, getUserDetail);
router.put("/:id/ban", protect, admin, toggleBanUser);

module.exports = router;
