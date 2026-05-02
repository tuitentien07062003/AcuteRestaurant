import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.routers.forecast import router as forecast_router
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.data_fetcher import DataFetcher
from app.models.forecaster import SalesForecaster
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler()


def nightly_job():
    """Cron job chạy 2AM hàng ngày."""
    logger.info("🌙 Bắt đầu nightly forecast batch...")
    try:
        fetcher = DataFetcher()
        store_ids = fetcher.fetch_all_store_ids()
        for sid in store_ids:
            try:
                df = fetcher.fetch_sales_history(sid, history_days=90)
                if len(df) < 7:
                    continue
                forecaster = SalesForecaster(model_type="auto")
                forecast_df, _ = forecaster.fit_predict(df, periods=7)
                fetcher.save_forecast_to_db(sid, forecast_df)
                logger.info(f"✅ Store {sid}: đã lưu {len(forecast_df)} ngày forecast.")
            except Exception as ex:
                logger.error(f"❌ Store {sid} batch lỗi: {ex}")
        logger.info("🌙 Kết thúc nightly forecast batch.")
    except Exception as e:
        logger.error(f"❌ Nightly job lỗi: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 AI Service khởi động...")
    scheduler.add_job(nightly_job, "cron", hour=2, minute=0, id="nightly_forecast")
    scheduler.start()
    logger.info("⏰ Đã đặt lịch nightly forecast 02:00 AM.")
    yield
    scheduler.shutdown()
    logger.info("🛑 AI Service tắt.")


app = FastAPI(
    title="Restaurant AI Forecast Service",
    description="Microservice dự báo doanh thu cho hệ thống Restaurant POS",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(forecast_router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ai-forecast", "version": "1.0.0"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)

