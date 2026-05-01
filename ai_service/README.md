# AI Forecast Service (Python/FastAPI)

> Microservice AI dự báo doanh thu cho hệ thống Restaurant POS

## 🚀 Tech Stack

- **Runtime:** Python 3.10+
- **Framework:** FastAPI
- **Server:** Uvicorn
- **ML/AI:** Facebook Prophet, XGBoost, scikit-learn
- **Data:** Pandas, NumPy
- **Scheduler:** APScheduler
- **DB:** PostgreSQL (psycopg2)

## 📋 Chức năng

### AI Models

| Model | Mô tả | Use Case |
|-------|-------|----------|
| **Prophet** | Time series forecasting | Dự báo doanh thu theo ngày |
| **XGBoost** | Gradient boosting | Dự báo với features phức tạp |
| **scikit-learn** | ML utilities | Preprocessing, metrics |

### Features

- Tự động train lại model hàng ngày (cron)
- Dự báo 7/30 ngày tới
- Confidence interval (yhat_lower, yhat_upper)
- Evaluation metrics (MAE, MAPE)
- Batch processing cho multi-store

## 🛠️ Cài đặt

```bash
cd ai_service
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## ⚙️ Cấu hình

Tạo file `.env`:

```env
# Database (Aiven PostgreSQL)
PGHOST=your-db-host.aivencloud.com
PGPORT=5432
PGDATABASE=your-db-name
PGUSER=your-db-user
PGPASSWORD=your-db-password

# Server
AI_PORT=5001
LOG_LEVEL=INFO

# Prophet config
MIN_HISTORY_DAYS=14
FORECAST_DAYS=7
```

## 🏃 Chạy service

```bash
python -m app.main
```

Server: http://localhost:5001
Docs: http://localhost:5001/docs

## 📁 Cấu trúc folder

```
ai_service/
├── app/
│   ├── main.py           # FastAPI entry
│   ├── models/
│   │   └── forecaster.py  # Prophet wrapper
│   ├── routers/
│   │   └── forecast.py   # API endpoints
│   ├── services/
│   │   ├── data_fetcher.py  # PostgreSQL query
│   │   └── scheduler.py # Cron jobs
│   └── schemas/
│       └── forecast.py   # Pydantic models
├── requirements.txt
├── Dockerfile
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Input | Output |
|--------|----------|-------|--------|
| POST | `/forecast/daily` | `{store_id, days, history_days}` | `[{"ds": "2025-01-20", "yhat": 1500000, "yhat_lower": 1200000, "yhat_upper": 1800000}]` |
| POST | `/forecast/train` | `{store_id}` | `{status: "trained", rows_used: 90}` |
| GET | `/forecast/health` | - | `{status: "ok"}` |
| GET | `/docs` | - | Swagger UI |

## 🔌 Integration với Backend

Backend gọi AI service qua HTTP:

```javascript
// backend/src/services/forecastService.js
const response = await fetch('http://localhost:5001/forecast/daily', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ store_id: 1, days: 7, history_days: 90 })
});
const forecast = await response.json();
```

## 📊 Data Pipeline

```
PostgreSQL (sales_summary)
    ↓ query 90 ngày
Pandas DataFrame (ds: date, y: net_sales)
    ↓
Prophet.fit()
    ↓
Prophet.predict(future_dates)
    ↓
JSON response [yhat, yhat_lower, yhat_upper]
    ↓
Backend → Frontend → Chart Display
```

## ⏰ Cron Automation

Tự động chạy lúc 2AM hàng ngày:
- Train lại model cho tất cả stores
- Dự báo 7 ngày tới
- Lưu vào PostgreSQL

Cấu hình trong `app/main.py`:
```python
from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.add_job(nightly_forecast, 'cron', hour=2)
scheduler.start()
```

## 📈 Evaluation

Model metrics được tính và trả về:

| Metric | Mô tả |
|--------|-------|
| MAE | Mean Absolute Error (VND) |
| MAPE | Mean Absolute Percentage Error (%) |
| R² | R-squared score |

## 🚀 Deploy

### Local
```bash
python -m app.main
```

### Docker
```bash
docker build -t ai-forecast-service ./ai_service
docker run -p 5001:5001 --env-file .env ai-forecast-service
```

### Render.com (Python)
- Connect GitHub repo
- Build command: `pip install -r requirements.txt`
- Start command: `python -m app.main`

## 🔗 Related Services

- **Backend:** http://localhost:3000
- **Frontend POS:** http://localhost:5173
- **Frontend HQ:** http://localhost:5174
- **Database:** Aiven PostgreSQL
