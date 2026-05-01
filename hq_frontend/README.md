# HQ Frontend (Headquarters Dashboard)

> Giao diện quản lý trung tâm - điều hành đa chi nhánh

## 🚀 Tech Stack

- **Framework:** React 19 + Vite 8
- **Routing:** React Router 7
- **State:** React Query
- **UI:** Radix UI + Tailwind CSS 4
- **HTTP:** Axios

## 📋 Chức năng

### HQ Dashboard Module
- **Quản lý chi nhánh** - Xem danh sách, thông tin chi tiết từng chi nhánh
- **Tổng hợp doanh thu** - So sánh giữa các chi nhánh
- **Quản lý nhân sự HQ** - Thêm/sửa/xóa nhân viên trung tâm
- **Quản lý lương** - Tính lương tập trung, giải ngân ngân hàng
- **Dự báo AI** - Xem dự báo doanh thu tập trung

## 🛠️ Cài đặt

```bash
cd hq_frontend
npm install
npm run dev
```

Truy cập: http://localhost:5174

## ⚙️ Cấu hình

Tạo file `.env`:

```env
VITE_API_URL=http://localhost:3000/acute
```

## 📁 Cấu trúc folder

```
hq_frontend/
├── src/
│   ├── api/            # API clients
│   ├── components/      # Reusable components
│   │   └── HQ/       # HQ-specific components
│   ├── hooks/         # Custom hooks
│   ├── pages/         # Page components
│   └── context/      # Global state
├── vite.config.js
└── tailwind.config.js
```

## 🔌 API Integration

| Module | API Endpoints |
|--------|------------|
| Stores | `/acute/store`, `/acute/hq/stores` |
| Employees | `/acute/employee`, `/acute/hq/employees` |
| Payroll | `/acute/payroll` |
| Sales | `/acute/sales` |
| Forecast | `/acute/sales/forecast` |

## 🚀 Deploy

```bash
npm run build
```

- Connect GitHub → Vercel
- Auto deploy on push

## 🔗 Related Services

- **Backend:** http://localhost:3000
- **POS Frontend:** http://localhost:5173
- **AI Service:** http://localhost:5001
