const router = require("express").Router();
const { getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const createUploader = require("../middlewares/upload");

const upload = createUploader("avatars");

router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single("avatar"), updateProfile);

module.exports = router;
