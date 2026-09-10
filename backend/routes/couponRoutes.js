const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
    getStoreCoupons,
    validateCoupon
} = require("../controllers/couponController");

const router = express.Router();

router.get("/store/:storeId", getStoreCoupons);
router.post("/validate", protect, validateCoupon);

module.exports = router;
