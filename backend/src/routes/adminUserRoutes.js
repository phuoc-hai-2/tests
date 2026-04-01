const router = require("express").Router();
const { protect, admin } = require("../middlewares/auth");
const {
  getUsers,
  getUserDetail,
  toggleBanUser,
  createUser,
  updateUser,
} = require("../controllers/adminUserController");

router.get("/", protect, admin, getUsers);
router.post("/", protect, admin, createUser);
router.get("/:id", protect, admin, getUserDetail);
router.put("/:id", protect, admin, updateUser);
router.put("/:id/ban", protect, admin, toggleBanUser);

module.exports = router;
