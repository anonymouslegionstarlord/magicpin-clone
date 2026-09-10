const mongoose = require("mongoose");

require("dotenv").config();

const User = require("../models/User");
const {
    importNearbyRestaurants
} = require("../services/restaurantImporter");
const {
    isAdminAccount
} = require("../utils/adminAccess");

const main = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 10000
    });

    const adminEmail = process.env.ADMIN_EMAIL
        ?.trim()
        .toLowerCase();
    const admin = await User.findOne({
        email: adminEmail
    }).select("_id email role");

    if (!isAdminAccount(admin)) {
        throw new Error("Configured Atlas admin account was not found");
    }

    const result = await importNearbyRestaurants({
        ownerId: admin._id,
        latitude: process.env.IMPORT_LATITUDE,
        longitude: process.env.IMPORT_LONGITUDE,
        radius: process.env.IMPORT_RADIUS_METERS || 5000,
        maxRestaurants:
            process.env.IMPORT_MAX_RESTAURANTS || 50,
        menuFeedUrl: process.env.MERCHANT_MENU_FEED_URL,
        dryRun: process.argv.includes("--dry-run")
    });

    console.log(JSON.stringify(result, null, 2));
};

main()
    .catch((error) => {
        console.error("Restaurant import failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
