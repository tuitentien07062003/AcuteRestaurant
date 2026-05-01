# Frontend (POS & Admin Dashboard)

> Giao diện POS bán hàng và Admin Dashboard quản lý chi nhánh

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 7
- **Routing:** React Router 7
- **State:** React Query 5 + Context API
- **UI:** Radix UI + Tailwind CSS 4
- **Forms:** React Hook Form + Zod
- **PDF:** @react-pdf/renderer
- **Build:** Vite (ESBuild)

## 📋 Chức năng

### POS Module (`/pos`)
- Đặt món và tính tiền
- Quản lý giỏ hàng (cart)
- Thanh toán và in hóa đơn PDF
- Kitchen Display Screen (KDS)
- Quản lý voucher/discount
- Xử lý hoàn đơn (refund)

### Admin Module (`/admin/*`)
- Dashboard tổng quan (doanh thu, nhân sự, kho)
- Quản lý nhân viên (thêm/sửa/xóa)
- Quản lý ca làm và chấm công
- Tính lương và báo cáo
- Quản lý kho vàInventory
- Quản lý hóa đơn mua hàng
- Quản lý phiếu chi
- Dự báo doanh thu (AI integrated)

## 🛠️ Cài đặt

```bash
cd frontend
npm install
npm run dev
```

Truy cập: http://localhost:5173

## ⚙️ Cấu hình

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:3000/acute
```

## 📁 Cấu trúc folder

```
frontend/
├── src/
│   ├── api/              # Axios clients
│   ├── components/        # Reusable components
│   │   ├── Admin/       # Admin dashboard components
│   │   ├── BillPDF.jsx  # Invoice PDF generator
│   │   ├── KitchenScreen.jsx
│   │   ├── Order.jsx
│   │   └── ...
│   ├── context/         # React contexts
│   ├── hooks/          # Custom hooks
│   ├── pages/         # Page components
│   │   ├── Admin.jsx
│   │   └── Pos.jsx
│   ├── schemas/        # Zod validation
│   └── types/        # TypeScript definitions
├── vite.config.js
├── tailwind.config.js
└── vercel.json        # Deployment config
```

## 🔌 API Integration

Base URL: `VITE_API_URL` (default: http://localhost:3000/acute)

| Module | API Endpoints |
|--------|------------|
| Auth | `/auth/login`, `/auth/register` |
| Menu | `/menu`, `/menu-categories` |
| Orders | `/bill-orders` |
| Employees | `/employee` |
| Timesheet | `/timesheet` |
| Payroll | `/payroll` |
| Inventory | `/inventory`, `/stock` |
| Finance | `/invoices`, `/payment-requests` |
| Sales | `/sales` |
| Vouchers | `/voucher` |

## 🚀 Deploy

```bash
npm run build
npm run preview
```

Deploy lên Vite:
- Connect GitHub repo → Vercel
- Auto deploy on push to `main`
- Environment: `VITE_API_URL`

## 🔗 Related Services

- **Backend:** http://localhost:3000
- **HQ Frontend:** http://localhost:5174
- **AI Service:** http://localhost:5001
