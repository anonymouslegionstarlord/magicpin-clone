const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
    createProduct,
    getProductsByStore,
    getProductsForAdmin,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
} = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, requireAdmin, createProduct);

router.get(
    "/store/:storeId/manage",
    protect,
    requireAdmin,
    getProductsForAdmin
);
router.get("/store/:storeId", getProductsByStore);
router.put("/:id", protect, requireAdmin, updateProduct);

router.delete("/:id", protect, requireAdmin, deleteProduct);

router.patch(
  "/:id/availability",
  protect,
  requireAdmin,
  toggleProductAvailability
);

module.exports = router;
