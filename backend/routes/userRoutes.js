const express = require("express");

const protect = require("../middleware/authMiddleware");
const {
    getMyProfile,
    updateProfileImage
} = require("../controllers/userController");

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.patch("/me/profile-image", protect, updateProfileImage);

module.exports = router;
