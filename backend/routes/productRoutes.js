const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createProduct,
    getProductsByStore,
    updateProduct,
    deleteProduct,
    toggleProductAvailability
} = require("../controllers/productController");

const router = express.Router();

router.post("/", protect, createProduct);

router.get("/store/:storeId", getProductsByStore);
router.put("/:id", protect, updateProduct);

router.delete("/:id", protect, deleteProduct);

router.patch(
  "/:id/availability",
  protect,
  toggleProductAvailability
);

module.exports = router;