// dependencies
import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

import { connectDB } from "./config/connectDB";
const PORT = process.env.PORT || 5000;

// import bookRouter from "./routes/book.router";
import productRouter from "./routes/product.router";
import bookOrderRouter from './routes/bookOrder.router';
import customerRouter from './routes/customer.route';
import photocopyOrderRouter from './routes/photocopyOrder.router';
import preOrderRouter from './routes/preOrder.router';
import sellBookRouter from './routes/sellYourBook.router';
import serviceRouter from "./routes/service.router";
import userRoutes from "./routes/user.router";

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://192.168.0.105:5173",
        "https://rainbow-baazaarbd.vercel.app",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Authorization",
    credentials: true
}));



// Routes
app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/books", bookRouter);
app.use("/api/v1/products", productRouter);
// app.use("/api/v1/services", serviceRouter);
// app.use("/api/v1/checkout-book", bookOrderRouter);
// app.use("/api/v1/order-sheet", photocopyOrderRouter);
// app.use("/api/v1/customers", customerRouter);
// app.use("/api/v1/sell-books", sellBookRouter);
// app.use("/api/v1/pre-orders", preOrderRouter);

// Connect to MongoDB
connectDB()

app.get("/",  (req, res) => {
    res.json({
        status:'Ok',
        message: "Rainbow bazaar BD api is running...",
    });
});

app.get("/health", (req, res) => {
    res.json({
        message: "Ok",
        status: "success",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version,
        platform: process.platform,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on:http://localhost:${PORT}`);
});
