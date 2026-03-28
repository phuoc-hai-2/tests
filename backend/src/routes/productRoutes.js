const router = require("express").Router();
const {
  getProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, admin } = require("../middlewares/auth");
const createUploader = require("../middlewares/upload");

const upload = createUploader("products");

router.get("/", getProducts);
router.get("/detail/:id", protect, admin, getProductById);
router.get("/:slug", getProductBySlug);
router.post("/", protect, admin, upload.array("images", 10), createProduct);
router.put("/:id", protect, admin, upload.array("images", 10), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
