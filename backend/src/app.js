const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authenticateToken = require("./middleware/authMiddleware");
const authorizeRole = require("./middleware/roleMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// Controllers
const categoryController = require("./controllers/categoryController");
const productController = require("./controllers/productController");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Security
app.disable("x-powered-by");
app.use(helmet());

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false
});

app.use("/api", apiLimiter);

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "API Sistem Informasi Asisten Bisnis Kedai Kopi berjalan!"
    });
});

// Authentication
app.use("/api/auth", authRoutes);

// User management - Admin only
app.use(
    "/api/users",
    authenticateToken,
    authorizeRole("admin"),
    userRoutes
);

// Category routes
const categoryRouter = express.Router();

categoryRouter.get(
    "/",
    categoryController.getAllCategories
);

categoryRouter.post(
    "/",
    authorizeRole("admin"),
    categoryController.createCategory
);

categoryRouter.put(
    "/:id",
    authorizeRole("admin"),
    categoryController.updateCategory
);

categoryRouter.delete(
    "/:id",
    authorizeRole("admin"),
    categoryController.deleteCategory
);

app.use(
    "/api/categories",
    authenticateToken,
    categoryRouter
);

// Product routes
const productRouter = express.Router();

productRouter.get(
    "/",
    productController.getAllProducts
);

productRouter.get(
    "/:id",
    productController.getProductById
);

productRouter.post(
    "/",
    authorizeRole("admin"),
    productController.createProduct
);

productRouter.put(
    "/:id",
    authorizeRole("admin"),
    productController.updateProduct
);

productRouter.patch(
    "/:id/status",
    authorizeRole("admin"),
    productController.updateProductStatus
);

app.use(
    "/api/products",
    authenticateToken,
    productRouter
);

// Transactions
app.use(
    "/api/transactions",
    authenticateToken,
    transactionRoutes
);

// Dashboard
app.use(
    "/api/dashboard",
    authenticateToken,
    dashboardRoutes
);

// Reports - Admin only
app.use(
    "/api/reports",
    authenticateToken,
    authorizeRole("admin"),
    reportRoutes
);

// 404
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Endpoint tidak ditemukan"
    });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;