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
const supportRoutes = require("./routes/supportRoutes");
const couponRoutes = require("./routes/couponRoutes");
const importRoutes = require("./routes/importRoutes");

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

app.use(express.json({ limit: "3mb" }));

/* =========================
   Health Routes
========================= */

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "FoodieHub Backend is Running!"
    });
});

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "API is working"
    });
});

/* =========================
   MongoDB Connection
========================= */

let mongoConnectionPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not configured");
    }

    if (!mongoConnectionPromise) {
        mongoConnectionPromise = mongoose
            .connect(process.env.MONGO_URI, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 10000
            })
            .then(() => {
                console.log("MongoDB connected successfully");
                return mongoose.connection;
            })
            .catch((error) => {
                mongoConnectionPromise = null;
                throw error;
            });
    }

    return mongoConnectionPromise;
};

/* =========================
   Database Middleware
========================= */

app.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        res.status(503).json({
            success: false,
            message: "Database connection unavailable"
        });
    }
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
app.use("/api/support", supportRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/import", importRoutes);

/* =========================
   Error Handler
========================= */

app.use((err, req, res, next) => {
    console.error("API Error:", err);

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            message: "Uploaded image is too large"
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

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
