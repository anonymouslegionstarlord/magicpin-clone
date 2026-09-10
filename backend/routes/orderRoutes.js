const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getStoreOrders
} = require("../controllers/orderController");

const router = express.Router();


// =====================================================
// CUSTOMER - CREATE ORDER
// =====================================================

router.post(
    "/",
    protect,
    createOrder
);


// =====================================================
// CUSTOMER - GET MY ORDERS
// =====================================================

router.get(
    "/",
    protect,
    getMyOrders
);


// =====================================================
// OWNER - GET STORE ORDERS
// IMPORTANT: Keep this BEFORE /:id
// =====================================================

router.get(
    "/store",
    protect,
    requireAdmin,
    getStoreOrders
);


// =====================================================
// CUSTOMER - GET ONE ORDER
// =====================================================

router.get(
    "/:id",
    protect,
    getOrderById
);


// =====================================================
// OWNER - UPDATE ORDER STATUS
// =====================================================

router.put(
    "/:id/status",
    protect,
    requireAdmin,
    updateOrderStatus
);


module.exports = router;
