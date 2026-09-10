const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createStore,
    getStores,
    getStoreById,
    getNearbyStores,
    searchStores,
    getStoresByCategory,
    getMyStores,
    updateStore
} = require("../controllers/storeController");

const router = express.Router();

router.post("/", protect, createStore);
router.get("/my", protect, getMyStores);

router.get("/", getStores);

router.get("/nearby", getNearbyStores);
router.get("/search", searchStores);
router.get("/category/:category", getStoresByCategory);
router.put("/:id", protect, updateStore);
router.get("/:id", getStoreById);

module.exports = router;