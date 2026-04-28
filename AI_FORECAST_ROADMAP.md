# 🗺️ LỘ TRÌNH TRIỂN KHAI: DỰ BÁO DOANH THU (Ý TƯỞNG #1)

> **Trạng thái:** Chờ phê duyệt từ bạn trước khi bắt đầu coding.
> **Mục tiêu:** Tự động dự báo doanh thu ngày mai / 7 ngày tới / 30 ngày tới dựa trên lịch sử `SalesSummary` và `BillOrder`.

---

## 📊 PHÂN TÍCH DỮ LIỆU HIỆN CÓ

### Database hiện tại liên quan:
| Bảng | Trường dùng cho forecast | Ghi chú |
|------|--------------------------|---------|
| `sales_summary` | `store_id`, `sales_date`, `net_sales`, `basic_sales`, `bill_count`, `forecast` | **Nguồn chính** - đã có index unique `[store_id, sales_date]` |
| `sales_summary` | `forecast` | Trường này hiện nhập tay, AI sẽ tự động điền |
| `bill_order` | `store_id`, `total_amount`, `created_at`, `status` | Backup nguồn nếu `sales_summary` thiếu dữ liệu |
| `store` | `id`, `tier` | Có thể dùng `tier` làm feature (cửa hàng cấp độ cao có pattern khác) |

### Điểm mạnh hiện tại:
- `forecast` field đã tồn tại trong `SalesSummary` model.
- UI HQ (`BranchDetailPage`) đã hiển thị cột Forecast và cho phép edit → chỉ cần thêm nút "Tự động dự báo".
- Hệ thống đã có Redis Cache cho các service khác → có thể tái sử dụng pattern.

---

## 🏗️ KIẾN TRÚC ĐỀ XUẤT

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend                                    │
│  ├─ HQ: BranchDetailPage (Thêm nút "AI Dự báo" + Chart so sánh)   │
│  └─ Admin: RevenueDashboard (Thêm Chart dự báo tuần/tới)          │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────────────┐
│                      Node.js Backend                                │
│  ├─ Route mới:  GET /api/sales/forecast?store_id=&days=7|30       │
│  ├─ Controller:  salesSummaryController.js (thêm hàm mới)         │
│  ├─ Service:     forecastService.js (gọi Python AI Service)       │
│  └─ Cache:       Redis (cache kết quả dự báo 1h)                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ HTTP (port riêng, ví dụ 5001)
┌───────────────────────────▼─────────────────────────────────────────┐
│                    Python AI Microservice                           │
│  ├─ Framework: FastAPI (nhẹ, async, tự động docs)                  │
│  ├─ Model:     Facebook Prophet (dễ dùng, seasonal tốt)           │
│  ├─ Pipeline:  Pandas → Prophet → JSON                             │
│  └─ Schedule:  APScheduler (chạy batch train lại mỗi đêm 2AM)     │
└─────────────────────────────────────────────────────────────────────┘
```

**Tại sao chia Python riêng?**
- Không phá vỡ stack Node.js hiện tại.
- Python có ecosystem ML hoàn chỉnh (pandas, prophet, scikit-learn).
- Dễ scale sau này (thêm model khác: recommendation, NLP...).

---

## 📋 CHI TIẾT TỪNG BƯỚC

### BƯỚC 1: Chuẩn bị môi trường Python AI Service (1-2 giờ)

**Tạo folder:** `ai_service/` ở root project

**Cấu trúc folder đề xuất:**
```
ai_service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── models/
│   │   ├── __init__.py
│   │   └── forecaster.py    # Wrapper class Prophet
│   ├── routers/
│   │   ├── __init__.py
│   │   └── forecast.py      # API endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   └── data_fetcher.py  # Kết nối PostgreSQL lấy sales data
│   └── schemas/
│       └── forecast.py      # Pydantic models (request/response)
├── requirements.txt         # fastapi, uvicorn, pandas, prophet, psycopg2-binary, APScheduler
├── Dockerfile               # (tùy chọn) containerize
└── README.md
```

**Cài đặt local:**
```bash
cd ai_service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

**Lưu ý quan trọng:** Nếu máy bạn chưa có Python, cần cài Python 3.10+ trước.

---

### BƯỚC 2: Xây dựng Python AI Service - API Dự báo (3-4 giờ)

**API đề xuất:**

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/forecast/daily` | `{store_id: 1, days: 7, history_days: 90}` | `{forecast: [{date: "2025-01-20", yhat: 1500000, yhat_lower: 1200000, yhat_upper: 1800000}], model_metrics: {mae: 50000}}` |
| POST | `/forecast/train` | `{store_id: 1}` | `{status: "trained", rows_used: 120}` |
| GET | `/health` | - | `{status: "ok"}` |

**Data Pipeline chi tiết:**
1. `data_fetcher.py` query PostgreSQL:
   ```sql
   SELECT sales_date, net_sales, bill_count
   FROM sales_summary
   WHERE store_id = ? AND sales_date >= CURRENT_DATE - INTERVAL '90 days'
   ORDER BY sales_date
   ```
2. `pandas` chuyển về DataFrame với cột `ds` (date) và `y` (net_sales).
3. `Prophet` train model (nếu dữ liệu < 2 ngày thì trả về lỗi "Không đủ dữ liệu").
4. `.predict(future)` trả về kết quả.
5. Trả JSON về Node.js backend.

**Xử lý trường hợp đặc biệt:**
- Không đủ dữ liệu (< 14 ngày): Trả về `yhat = trung bình 7 ngày gần nhất`.
- Thiếu dữ liệu ngày cuối tuần: Prophet tự xử lý, nhưng nên điền `0` cho ngày đóng cửa (nếu có policy đóng cửa).
- Multi-store: Train model riêng cho từng `store_id` vì pattern khác nhau.

---

### BƯỚC 3: Tích hợp vào Node.js Backend (2-3 giờ)

**Thay đổi file:**

1. **Tạo `backend/src/services/forecastService.js`**
   - Hàm `getForecast(storeId, days)`: gọi HTTP POST đến Python service (`http://localhost:5001/forecast/daily`).
   - Hàm `triggerTraining(storeId)`: gọi train endpoint.
   - Timeout 10 giây, retry 1 lần nếu fail.

2. **Mở rộng `backend/src/controllers/salesSummaryController.js`**
   - Thêm `getForecast = async (req, res)`: nhận `store_id`, `days`, gọi `forecastService`.
   - Thêm `runForecastTraining = async (req, res)`: cho phép admin trigger train thủ công.

3. **Mở rộng `backend/src/routes/salesRoutes.js`**
   - Thêm `router.post("/forecast", getForecast);`
   - Thêm `router.post("/forecast/train", runForecastTraining);`

4. **Cập nhật `backend/src/models/SalesSummary.js`** (nếu cần)
   - Trường `forecast` đã có sẵn, không cần migration.
   - Có thể thêm `forecast_generated_at` (DATE) để biết khi nào AI tạo dự báo này.

---

### BƯỚC 4: Tự động hóa - Cron Job (1 giờ)

**Mục tiêu:** Mỗi đêm 2AM, AI service tự động:
1. Train lại model cho tất cả store đang active.
2. Dự báo 7 ngày tới.
3. Lưu kết quả vào bảng `sales_summary` (các ngày tương lai).

**Cách triển khai:**
- Trong `ai_service`, dùng `APScheduler` đặt lịch chạy hàm `nightly_forecast_job()`.
- Hàm này query `SELECT DISTINCT store_id FROM sales_summary`, lặp qua từng store, gọi internal logic train+predict, sau đó INSERT/UPDATE vào PostgreSQL trực tiếp.

**Schema lưu forecast vào DB:**
```sql
-- Với ngày tương lai chưa có record, tạo mới:
INSERT INTO sales_summary (id, store_id, sales_date, forecast, created_at)
VALUES (gen_random_uuid(), 1, '2025-01-20', 1500000, NOW())
ON CONFLICT (store_id, sales_date) DO UPDATE SET forecast = EXCLUDED.forecast;
```

---

### BƯỚC 5: Frontend - Hiển thị Dự báo (3-4 giờ)

#### 5.1 HQ Dashboard (`hq_frontend/src/pages/BranchDetailPage.jsx`)

**Thay đổi:**
- Thêm nút "🤖 AI Dự báo" bên cạnh nút Edit trong tab "Kinh doanh & KPI".
- Khi click: Gọi `POST /api/sales/forecast` → hiển thị kết quả trong modal/chart.
- Thêm biểu đồ so sánh: đường thực tế (xanh) vs đường dự báo (cam) vs vùng tin cậy (mờ).

**Thư viện chart đề xuất:** `recharts` (đã có thể dùng trong React, nhẹ) hoặc `chart.js`.

#### 5.2 Admin Dashboard (`frontend/src/components/Admin/RevenueDashboard.jsx`)

**Thay đổi:**
- Thêm card "Dự báo 7 ngày tới" hiển thị tổng dự báo và % so với 7 ngày trước.
- Thêm mini chart line chart trong card.
- Thêm badge cảnh báo: "Dự báo tuần tới giảm 15% so với tuần này → Chuẩn bị nhân sự".

#### 5.3 API Hooks mới cần tạo:

| Hook | File | Mục đích |
|------|------|----------|
| `useForecast` | `hq_frontend/src/hooks/useForecast.js` | Gọi API dự báo, cache 1 giờ |
| `useForecastAdmin` | `frontend/src/hooks/useForecastAdmin.js` | Gọi API dự báo cho admin view |

---

### BƯỚC 6: Testing & Validation (2-3 giờ)

**Test cases:**
1. **Unit test Python:** Dùng sample data 30 ngày, kiểm tra output có đúng format JSON không.
2. **Integration test:** Gọi từ Node.js → Python → trả về đúng trong < 3 giây.
3. **Edge case:** Store không có dữ liệu 14 ngày → phải trả về fallback thay vì crash.
4. **UI test:** Nút AI Dự báo hiển thị loading spinner khi đang chạy.

**Metric đánh giá model:**
- `MAE` (Mean Absolute Error): Sai số trung bình VND.
- `MAPE` (Mean Absolute Percentage Error): Sai số %.
- Hiển thị metric này trong UI để admin biết độ tin cậy.

---

### BƯỚC 7: Tối ưu & Production-ready (2 giờ, optional)

- [ ] Dockerize `ai_service` (thêm vào `docker-compose.yml` nếu có).
- [ ] Thêm rate limiting cho `/forecast` API (tránh spam train).
- [ ] Log training history vào file hoặc DB table `forecast_logs`.
- [ ] Thêm cấu hình `.env` cho `AI_SERVICE_URL`, `MIN_HISTORY_DAYS`.
- [ ] Fallback: Nếu Python service down, Node.js backend dùng thuật toán đơn giản (moving average) để trả kết quả.

---

## 📅 ƯỚC TÍNH THỜI GIAN TỔNG HỢP

| Bước | Thờ gian | Độ phức tạp |
|------|----------|-------------|
| 1. Setup Python env | 1-2h | ⭐⭐ |
| 2. Python AI Service | 3-4h | ⭐⭐⭐ |
| 3. Node.js Integration | 2-3h | ⭐⭐ |
| 4. Cron Automation | 1h | ⭐⭐ |
| 5. Frontend Charts | 3-4h | ⭐⭐⭐ |
| 6. Testing | 2-3h | ⭐⭐ |
| 7. Optimization | 2h | ⭐⭐⭐ |
| **TỔNG** | **14-19 giờ** | |

---

## 🎯 KẾT QUẢ MONG ĐỢI SAU KHI HOÀN THÀNH

1. **Nút "AI Dự báo"** trên HQ Dashboard → click là thấy đường cong dự báo 7/30 ngày.
2. **Tự động 2AM mỗi ngày** AI train lại và cập nhật forecast cho tất cả chi nhánh.
3. **Admin Dashboard** có cảnh báo "Dự báo giảm doanh thu" để chủ động điều phối.
4. **Cột Forecast** trong bảng KPI không còn nhập tay nữa (trừ khi admin muốn override).
5. **API docs** tự động tại `http://localhost:5001/docs` (Swagger UI của FastAPI).

---

## ⚠️ RỦI RO & GIẢI PHÁP DỰ PHÒNG

| Rủi ro | Giải pháp |
|--------|-----------|
| Python service crash | Node.js backend fallback: Moving Average 7 ngày |
| Không đủ dữ liệu (< 14 ngày) | Trả về trung bình 7 ngày gần nhất + cảnh báo |
| Prophet train chậm | Giới hạn `history_days` = 90 (thay vì toàn bộ lịch sử) |
| Windows không cài được Prophet | Dùng WSL2 hoặc Docker container |
| Sinh viên chưa biết Python ML | Code Prophet rất ngắn (~10 dòng train), tôi sẽ hỗ trợ chi tiết |

---

## ❓ CÂU HỎI CHO BẠN TRƯỚC KHI BẮT ĐẦU

1. **Bạn muốn triển khai theo kiến trúc microservice Python riêng** hay **gom chung vào Node.js** (dùng thư viện JS đơn giản hơn nhưng kém chính xác)?
2. **Thờ gian dự báo:** Chỉ cần 7 ngày tới hay cả 30 ngày?
3. **Có muốn thêm yếu tố ngoại vi** không? (ví dụ: ngày lễ, thứ trong tuần, thờ tiết...) Prophet tự xử lý được seasonal nhưng nếu bạn có dữ liệu "ngày lễ" thì độ chính xác cao hơn.
4. **Máy bạn đã cài Python 3.10+ chưa?** (Nếu chưa, tôi sẽ hướng dẫn hoặc đề xuất cách khác).

---

> **Hãy cho tôi biết bạn đồng ý với lộ trình này không, và trả lờ 4 câu hỏi trên. Tôi sẽ bắt đầu coding ngay sau đó.**

