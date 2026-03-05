import express from 'express';
import dotenv from 'dotenv';
import employeesRoutes from './routes/employeesRoutes.js';
import storeRoutes from './routes/storeRoutes.js';
import menuCategoryRoutes from './routes/menuCategoryRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import timesheetRoutes from './routes/timesheetRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import billOrderRoutes from './routes/billOrderRoutes.js';
import salesRoutes from './routes/salesRoutes.js'
import refundRoutes from './routes/refundRoutes.js'
import { connectDB } from './config/db.js';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import { requireLogin } from './middlewares/authMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://acute-restaurant.vercel.app"
];

const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER;

app.use(cors({
  origin: function(origin, callback) {
    // Cho phép không có origin hoặc các origin trong danh sách
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || allowedOrigins[2]); // Pass origin explicitly
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
app.use(express.json());
app.use(session({
  name: "pos.sid",
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: isProduction, // Only secure in production
    sameSite: isProduction ? "none" : "lax", // none for cross-origin in prod, lax for dev
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
}));

app.use("/acute/employee", requireLogin, employeesRoutes);
app.use("/acute/store", requireLogin, storeRoutes);
app.use("/acute/menu-categories", requireLogin, menuCategoryRoutes);
app.use("/acute/menu", requireLogin, menuRoutes);
app.use("/acute/auth", authRoutes);
app.use("/acute/users", requireLogin, userRoutes);
app.use("/acute/timesheet", requireLogin, timesheetRoutes);
app.use("/acute/voucher",  voucherRoutes);
app.use("/acute/bill-orders", requireLogin, billOrderRoutes);
app.use("/acute/sales", requireLogin, salesRoutes);
app.use("/acute/refund", requireLogin, refundRoutes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
  });
});