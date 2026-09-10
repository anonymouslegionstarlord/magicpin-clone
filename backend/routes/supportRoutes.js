const express = require("express");
const {
    createSupportTicket
} = require("../controllers/supportController");

const router = express.Router();

router.post("/contact", createSupportTicket);

module.exports = router;
