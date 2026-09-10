const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    addToCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} = require("../controllers/cartController");

const router = express.Router();

router.post("/", protect, addToCart);

router.get("/", protect, getCart);
router.put("/:productId", protect, updateCartItem);

router.delete("/:productId", protect, removeCartItem);

router.delete("/", protect, clearCart);

module.exports = router;