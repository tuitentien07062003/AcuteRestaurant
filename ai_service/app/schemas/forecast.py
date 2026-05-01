from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class ForecastRequest(BaseModel):
    store_id: int = Field(..., description="ID của cửa hàng cần dự báo")
    days: int = Field(default=7, ge=1, le=30, description="Số ngày cần dự báo (1-30)")
    history_days: int = Field(default=90, ge=14, le=365, description="Số ngày lịch sử dùng để train")


class ForecastItem(BaseModel):
    date: str
    yhat: float = Field(..., description="Giá trị dự báo")
    yhat_lower: float = Field(..., description="Ngưỡng dưới khoảng tin cậy 80%")
    yhat_upper: float = Field(..., description="Ngưỡng trên khoảng tin cậy 80%")


class ModelMetrics(BaseModel):
    mae: Optional[float] = None
    mape: Optional[float] = None
    rows_used: int = 0
    model_type: str = "prophet"
    note: Optional[str] = None


class ForecastResponse(BaseModel):
    store_id: int
    forecast: List[ForecastItem]
    metrics: ModelMetrics

