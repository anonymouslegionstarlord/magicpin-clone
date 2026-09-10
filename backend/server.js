const dns = require("dns");

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   CORS
========================= */

const allowedOrigin = process.env.FRONTEND_URL;

app.use(
    cors({
        origin: allowedOrigin || "http://localhost:5173",
        credentials: true
    })
);

/* =========================
   Middleware
========================= */

app.use(express.json());

/* =========================
   Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   Health Check
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Magicpin Backend is Running!"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working"
    });
});

/* =========================
   MongoDB
========================= */

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error.message);
        process.exit(1);
    });