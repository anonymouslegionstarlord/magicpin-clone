const express = require("express");

const protect = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const {
    createStore,
    getStores,
    getStoreById,
    getNearbyStores,
    searchStores,
    getStoresByCategory,
    getMyStores,
    updateStore,
    archiveStore
} = require("../controllers/storeController");

const router = express.Router();

router.post("/", protect, requireAdmin, createStore);
router.get("/my", protect, requireAdmin, getMyStores);

router.get("/", getStores);

router.get("/nearby", getNearbyStores);
router.get("/search", searchStores);
router.get("/category/:category", getStoresByCategory);
router.put("/:id", protect, requireAdmin, updateStore);
router.delete("/:id", protect, requireAdmin, archiveStore);
router.get("/:id", getStoreById);

module.exports = router;
