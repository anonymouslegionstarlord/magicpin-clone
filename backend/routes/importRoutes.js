const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const requireCronSecret = require("../middleware/cronMiddleware");
const {
    importRestaurantsManually,
    importRestaurantsOnSchedule
} = require("../controllers/importController");

const router = express.Router();

router.post(
    "/restaurants",
    protect,
    requireAdmin,
    importRestaurantsManually
);

router.get(
    "/restaurants/cron",
    requireCronSecret,
    importRestaurantsOnSchedule
);

module.exports = router;
