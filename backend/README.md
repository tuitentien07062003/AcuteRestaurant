# Backend API (Node.js/Express)

> REST API Server cho hệ thống Restaurant POS - Quản lý đa chi nhánh

## 🚀 Tech Stack

- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js 4
- **ORM:** Sequelize 6 (PostgreSQL)
- **Cache:** Redis (ioredis + Upstash)
- **Auth:** JWT + bcrypt
- **Validation:** Joi
- **Logs/Traces:** OpenTelemetry (OTLP)
- **Docker:** Multi-stage build

## 📋 Chức năng

### Core Modules

| Module | Chức năng | Routes |
|--------|----------|--------|
| **Auth** | Login, register, JWT | `/acute/auth/*` |
| **Users** | Quản lý users | `/acute/users/*` |
| **Stores** | Quản lý chi nhánh | `/acute/store/*` |
| **Menu** | Menu & categories | `/acute/menu/*`, `/acute/menu-categories/*` |
| **Orders** | Bill Orders | `/acute/bill-orders/*` |
| **Employees** | Nhân viên | `/acute/employee/*` |
| **Timesheet** | Chấm công | `/acute/timesheet/*` |
| **Payroll** | Tính lương | `/acute/payroll/*` |
| **Inventory** | Tồn kho | `/acute/inventory/*` |
| **Stock** | Kho & Stock Logs | `/acute/stock/*` |
| **Finance** | Invoices, Payments | `/acute/invoices/*`, `/acute/payment-requests/*` |
| **Sales** | Doanh thu | `/acute/sales/*` |
| **Vouchers** | Voucher/discount | `/acute/voucher/*` |
| **HQ** | Headquarters API | `/acute/hq/*` |

## 🛠️ Cài đặt

```bash
cd backend
npm install
npm run dev
```

Server chạy: http://localhost:3000

## ⚙️ Cấu hình

Tạo file `.env`:

```env
# Database (Aiven PostgreSQL)
PGHOST=your-db-host.aivencloud.com
PGPORT=5432
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password

# Redis (Upstash)
REDIS_URL=redis://default:password@host.upstash.io:6379

# Auth
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Server
PORT=3000
NODE_ENV=development

# OpenTelemetry (Grafana/Any)
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway.nr-config.io
OTEL_EXPORTER_OTLP_HEADERS=your-headers
```

## 📁 Cấu trúc folder

```
backend/
├── src/
│   ├── config/          # DB, Redis configs
│   ├── controllers/    # Request handlers
│   ├── middlewares/     # Auth, validation
│   ├── models/        # Sequelize models
│   ├── routes/       # Express routes
│   ├── services/     # Business logic + Redis cache
│   ├── instrumentation.js  # OTEL setup
│   └── server.js     # Entry point
├── migrations/       # DB migrations
├── uploads/        # Uploaded files
├── Dockerfile
└── package.json
```

## 🗄️ Database Models

| Model | Mô tả |
|-------|-------|
| User | Tài khoản đăng nhập |
| Store | Chi nhánh nhà hàng |
| MenuCategory | Danh mục món ăn |
| MenuItem | Món ăn |
| BillOrder | Đơn hàng |
| DetailOrder | Chi tiết đơn hàng |
| Employee | Nhân viên |
| Timesheet | Chấm công |
| Payroll | Bảng lương |
| PayrollDetail | Chi tiết lương |
| Inventory | Nguyên liệu |
| Stock | Tồn kho |
| StockLog | Lịch sử kho |
| Invoice | Hóa đơn mua hàng |
| InvoiceDetail | Chi tiết hóa đơn |
| PaymentRequest | Phiếu chi |
| PaymentRequestDetail | Chi tiết phiếu chi |
| SalesSummary | Tổng kết doanh thu |
| Voucher | Voucher giảm giá |
| Refund | Hoàn đơn |

## 🔌 Redis Cache Strategy

Tất cả các service đều implement cache theo pattern:

```javascript
// Pseudocode
const getData = async (id) => {
  // 1. Check cache
  const cached = await redis.get(`key:${id}`);
  if (cached) return JSON.parse(cached);

  // 2. Query DB
  const data = await db.findById(id);

  // 3. Save to cache (TTL: 5 min)
  await redis.setex(`key:${id}`, 300, JSON.stringify(data));

  return data;
};
```

Các cache services:
- `menuItemCacheService`
- `menuCategoryCacheService`
- `employeeCacheService`
- `storeCacheService`
- `billOrderCacheService`
- `timesheetCacheService`
- `payrollCacheService`
- `inventoryCacheService`
- `stockCacheService`
- `invoiceCacheService`
- `paymentRequestCacheService`
- `voucherCacheService`
- `salesSummaryCacheService`
- `financeCacheService`

## 📡 API Examples

### Login
```bash
POST /acute/auth/login
Body: { username: "admin", password: "123" }
Response: { token: "jwt...", user: {...} }
```

### Get Menu
```bash
GET /acute/menu?storeId=1
Headers: Authorization: Bearer <token>
```

### Create Order
```bash
POST /acute/bill-orders
Body: {
  storeId: 1,
  items: [{ menuItemId: 1, quantity: 2 }],
  paymentMethod: "cash"
}
```

## 🚀 Deploy

### Local Docker
```bash
docker build -t restaurant-backend .
docker run -p 3000:3000 --env-file .env restaurant-backend
```

### Render.com
- Connect GitHub repo
- Build command: `npm install`
- Start command: `npm start`
- Environment variables trong Render dashboard

## 🔒 Security

- JWT authentication với expiration
- Password hashing (bcrypt)
- Role-based access (admin, manager, employee)
- Input validation (Joi)
- CORS whitelist

## 📊 Observability

OpenTelemetry integration:
- Traces → Grafana/Any OTLP endpoint
- Metrics → Prometheus format
- Logs → Structured JSON logs

## 🔗 Related Services

- **Frontend POS:** http://localhost:5173
- **Frontend HQ:** http://localhost:5174
- **AI Service:** http://localhost:5001
- **Database:** Aiven PostgreSQL
- **Cache:** Upstash Redis
