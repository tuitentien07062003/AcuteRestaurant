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

app.use(cors({
  origin: "https://acute-restaurant.vercel.app",
  credentials: true
}));

app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));
app.use(express.json());
app.use(session({
  name: "pos.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

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