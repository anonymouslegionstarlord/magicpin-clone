const User = require("../models/User");
const {
    importNearbyRestaurants
} = require("../services/restaurantImporter");
const {
    isAdminAccount
} = require("../utils/adminAccess");

const runImport = async ({
    ownerId,
    latitude,
    longitude,
    radius,
    maxRestaurants,
    dryRun
}) =>
    importNearbyRestaurants({
        ownerId,
        latitude,
        longitude,
        radius: radius ?? 5000,
        maxRestaurants: maxRestaurants ?? 50,
        dryRun: dryRun === true,
        menuFeedUrl: process.env.MERCHANT_MENU_FEED_URL
    });

const importRestaurantsManually = async (req, res) => {
    try {
        const result = await runImport({
            ownerId: req.userId,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            radius: req.body.radius,
            maxRestaurants: req.body.maxRestaurants,
            dryRun: req.body.dryRun
        });

        res.status(200).json({
            success: true,
            message: result.dryRun
                ? "Restaurant scan preview completed"
                : "Restaurant import completed",
            result
        });
    } catch (error) {
        console.error("Manual restaurant import error:", error);

        res.status(400).json({
            success: false,
            message: error.message || "Restaurant import failed"
        });
    }
};

const importRestaurantsOnSchedule = async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

        const admin = await User.findOne({
            email: adminEmail
        }).select("_id email role");

        if (!isAdminAccount(admin)) {
            return res.status(503).json({
                success: false,
                message: "Configured admin account is unavailable"
            });
        }

        const result = await runImport({
            ownerId: admin._id,
            latitude: process.env.IMPORT_LATITUDE,
            longitude: process.env.IMPORT_LONGITUDE,
            radius: process.env.IMPORT_RADIUS_METERS || 5000,
            maxRestaurants:
                process.env.IMPORT_MAX_RESTAURANTS || 50,
            dryRun: false
        });

        res.status(200).json({
            success: true,
            message: "Scheduled restaurant import completed",
            result
        });
    } catch (error) {
        console.error("Scheduled restaurant import error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Scheduled import failed"
        });
    }
};

module.exports = {
    importRestaurantsManually,
    importRestaurantsOnSchedule
};
