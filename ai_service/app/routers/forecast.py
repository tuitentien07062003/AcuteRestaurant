import logging
from fastapi import APIRouter, HTTPException
from app.schemas.forecast import ForecastRequest, ForecastResponse, ForecastItem, ModelMetrics
from app.services.data_fetcher import DataFetcher
from app.models.forecaster import SalesForecaster

router = APIRouter(prefix="/forecast", tags=["Forecast"])
logger = logging.getLogger(__name__)


@router.post("/daily", response_model=ForecastResponse)
async def forecast_daily(payload: ForecastRequest):
    """
    Dự báo doanh thu cho store_id trong N ngày tới.
    """
    try:
        fetcher = DataFetcher()
        df = fetcher.fetch_sales_history(payload.store_id, payload.history_days)

        if len(df) < 7:
            logger.warning(f"Store {payload.store_id} chỉ có {len(df)} ngày dữ liệu.")
            raise HTTPException(
                status_code=400,
                detail=f"Không đủ dữ liệu lịch sử (cần ít nhất 7 ngày, hiện có {len(df)} ngày)."
            )

        forecaster = SalesForecaster(model_type="auto")
        forecast_df, metrics = forecaster.fit_predict(df, periods=payload.days)

        forecast_items = [
            ForecastItem(
                date=row["ds"].strftime("%Y-%m-%d"),
                yhat=round(row["yhat"], 2),
                yhat_lower=round(row["yhat_lower"], 2),
                yhat_upper=round(row["yhat_upper"], 2),
            )
            for _, row in forecast_df.iterrows()
        ]

        return ForecastResponse(
            store_id=payload.store_id,
            forecast=forecast_items,
            metrics=ModelMetrics(**metrics),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lỗi forecast_daily: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi dự báo: {str(e)}")


@router.post("/train")
async def train_model(store_id: int, history_days: int = 90):
    """
    Train model cho 1 store và trả về metrics (không predict).
    """
    try:
        fetcher = DataFetcher()
        df = fetcher.fetch_sales_history(store_id, history_days)

        if len(df) < 7:
            raise HTTPException(status_code=400, detail="Không đủ dữ liệu để train.")

        forecaster = SalesForecaster(model_type="auto")
        forecaster.fit(df)

        return {
            "status": "trained",
            "store_id": store_id,
            "rows_used": len(df),
            "model_type": forecaster.model_type_used,
            "metrics": forecaster.metrics,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Lỗi train_model: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi train: {str(e)}")


@router.post("/nightly-batch")
async def nightly_batch(days: int = 7, history_days: int = 90):
    """
    Chạy batch cho TẤT CẢ store. Trả về summary.
    Thường được gọi bởi cron job lúc 2AM.
    """
    try:
        fetcher = DataFetcher()
        store_ids = fetcher.fetch_all_store_ids()
        results = []

        for sid in store_ids:
            try:
                df = fetcher.fetch_sales_history(sid, history_days)
                if len(df) < 7:
                    results.append({"store_id": sid, "status": "skipped", "reason": "not_enough_data"})
                    continue

                forecaster = SalesForecaster(model_type="auto")
                forecast_df, metrics = forecaster.fit_predict(df, periods=days)
                rows_saved = fetcher.save_forecast_to_db(sid, forecast_df)
                results.append({"store_id": sid, "status": "success", "rows_saved": rows_saved, "metrics": metrics})
            except Exception as ex:
                logger.error(f"Batch lỗi store {sid}: {ex}")
                results.append({"store_id": sid, "status": "error", "reason": str(ex)})

        return {"total": len(store_ids), "results": results}
    except Exception as e:
        logger.error(f"Lỗi nightly_batch: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi batch: {str(e)}")

