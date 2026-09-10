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

/* =========================
   CORS
========================= */

app.use(
    cors({
        origin:
            process.env.FRONTEND_URL ||
            "http://localhost:5173",
        credentials: true
    })
);

/* =========================
   Middleware
========================= */

app.use(express.json());

/* =========================
   Health Routes
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
   API Routes
========================= */

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

/* =========================
   Error Handler
========================= */

app.use((err, req, res, next) => {
    console.error("API Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

/* =========================
   MongoDB Connection
========================= */

let mongoConnected = false;

const connectDB = async () => {
    if (mongoConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        mongoConnected = true;

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }
};

/* =========================
   Vercel / Local Server
========================= */

if (process.env.VERCEL !== "1") {
    const PORT = process.env.PORT || 5000;

    connectDB()
        .then(() => {
            app.listen(PORT, "0.0.0.0", () => {
                console.log(
                    `Server running on http://localhost:${PORT}`
                );
            });
        })
        .catch((error) => {
            console.error(
                "Server startup failed:",
                error.message
            );

            process.exit(1);
        });
}

module.exports = app;