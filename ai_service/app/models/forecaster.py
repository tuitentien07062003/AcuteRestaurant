import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Tuple, Optional, List
import logging

logger = logging.getLogger(__name__)

# Thử import XGBoost
XGBOOST_AVAILABLE = False
try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except Exception as e:
    logger.warning(f"XGBoost không khả dụng ({e}), sẽ fallback sang sklearn.")

# Sklearn fallback
SKLEARN_AVAILABLE = False
try:
    from sklearn.linear_model import LinearRegression
    from sklearn.preprocessing import OneHotEncoder
    from sklearn.compose import ColumnTransformer
    from sklearn.pipeline import Pipeline
    SKLEARN_AVAILABLE = True
except Exception as e:
    logger.warning(f"sklearn không khả dụng ({e}).")


class SalesForecaster:
    def __init__(self, model_type: str = "auto"):
        """
        model_type: "xgboost" | "sklearn" | "auto"
        auto = thử XGBoost trước, nếu không được thì sklearn, nếu không được thì moving_average
        """
        self.model_type = model_type
        self.model = None
        self.fallback_used = False
        self.metrics = {}
        self._feature_cols = None
        self._last_date = None

    def _build_xgboost_model(self):
        if not XGBOOST_AVAILABLE:
            return None
        model = XGBRegressor(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            subsample=0.8,
            objective='reg:squarederror',
            random_state=42,
            n_jobs=2,
        )
        return model

    def _build_sklearn_pipeline(self):
        if not SKLEARN_AVAILABLE:
            return None
        preprocessor = ColumnTransformer(
            transformers=[
                ("dow", OneHotEncoder(drop="first", sparse_output=False), ["dayofweek"]),
            ],
            remainder="passthrough",
        )
        pipeline = Pipeline([
            ("preprocess", preprocessor),
            ("regressor", LinearRegression()),
        ])
        return pipeline

    def _prepare_features(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Tạo features cho XGBoost / Sklearn.
        Các features: dayofweek, month, dayofmonth, is_weekend,
                      rolling_mean_7, rolling_mean_14,
                      sin_dayofweek, cos_dayofweek, sin_month, cos_month
        """
        df = df.copy()
        df["dayofweek"] = df["ds"].dt.dayofweek
        df["month"] = df["ds"].dt.month
        df["dayofmonth"] = df["ds"].dt.day
        df["is_weekend"] = df["dayofweek"].isin([5, 6]).astype(int)

        # Cyclical encoding để model hiểu chu kỳ tuần/tháng
        df["sin_dayofweek"] = np.sin(2 * np.pi * df["dayofweek"] / 7)
        df["cos_dayofweek"] = np.cos(2 * np.pi * df["dayofweek"] / 7)
        df["sin_month"] = np.sin(2 * np.pi * df["month"] / 12)
        df["cos_month"] = np.cos(2 * np.pi * df["month"] / 12)

        # Rolling mean (shift 1 để tránh data leak khi training)
        if is_training and "y" in df.columns:
            df["rolling_mean_7"] = df["y"].shift(1).rolling(window=7, min_periods=1).mean()
            df["rolling_mean_14"] = df["y"].shift(1).rolling(window=14, min_periods=1).mean()
        else:
            # Khi predict future: dùng mean của toàn bộ lịch sử đã train
            last_mean = getattr(self, "_hist_mean", 0)
            df["rolling_mean_7"] = last_mean
            df["rolling_mean_14"] = last_mean

        return df

    def _get_feature_columns(self) -> List[str]:
        return [
            "dayofweek", "month", "dayofmonth", "is_weekend",
            "sin_dayofweek", "cos_dayofweek", "sin_month", "cos_month",
            "rolling_mean_7", "rolling_mean_14",
        ]

    def fit(self, df: pd.DataFrame) -> "SalesForecaster":
        """
        Train model với DataFrame có cột ds, y
        """
        if len(df) < 2:
            raise ValueError("Cần ít nhất 2 ngày dữ liệu để dự báo.")

        df = df.copy().sort_values("ds").reset_index(drop=True)
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = pd.to_numeric(df["y"], errors="coerce")
        df = df.dropna(subset=["y"])

        # Lưu lại để predict dùng
        self._last_date = df["ds"].max()
        self._hist_mean = float(df["y"].mean())
        self._hist_std = float(df["y"].std()) if len(df) > 1 else self._hist_mean * 0.1

        actual_model_type = self.model_type

        if actual_model_type == "auto":
            if XGBOOST_AVAILABLE:
                actual_model_type = "xgboost"
            elif SKLEARN_AVAILABLE:
                actual_model_type = "sklearn"
            else:
                actual_model_type = "moving_average"

        # --- XGBoost ---
        if actual_model_type == "xgboost":
            xgb_model = self._build_xgboost_model()
            if xgb_model is not None:
                try:
                    df_feat = self._prepare_features(df, is_training=True)
                    feature_cols = self._get_feature_columns()
                    X = df_feat[feature_cols].fillna(0)
                    y = df_feat["y"]

                    xgb_model.fit(X, y)
                    self.model = xgb_model
                    self.model_type_used = "xgboost"
                    self._feature_cols = feature_cols

                    y_pred = xgb_model.predict(X)
                    mae = np.mean(np.abs(y - y_pred))
                    self.metrics = {"mae": float(mae), "model_type": "xgboost"}
                    return self
                except Exception as e:
                    logger.warning(f"XGBoost train thất bại: {e}. Fallback...")
                    self.fallback_used = True
                    actual_model_type = "sklearn" if SKLEARN_AVAILABLE else "moving_average"

        # --- Sklearn ---
        if actual_model_type == "sklearn":
            pipeline = self._build_sklearn_pipeline()
            if pipeline is not None:
                try:
                    df_feat = self._prepare_features(df, is_training=True)
                    feature_cols = ["dayofweek", "month", "dayofmonth", "is_weekend",
                                    "sin_dayofweek", "cos_dayofweek", "sin_month", "cos_month",
                                    "rolling_mean_7", "rolling_mean_14"]
                    X = df_feat[feature_cols].fillna(0)
                    y = df_feat["y"]
                    pipeline.fit(X, y)
                    self.model = pipeline
                    self.model_type_used = "sklearn"
                    self._feature_cols = feature_cols
                    y_pred = pipeline.predict(X)
                    mae = np.mean(np.abs(y - y_pred))
                    self.metrics = {"mae": float(mae), "model_type": "sklearn"}
                    return self
                except Exception as e:
                    logger.warning(f"Sklearn train thất bại: {e}. Fallback...")
                    self.fallback_used = True
                    actual_model_type = "moving_average"

        # --- Moving Average Fallback ---
        self.model_type_used = "moving_average"
        self.model = {
            "mean": float(df["y"].mean()),
            "last_7_mean": float(df["y"].tail(7).mean())
        }
        self.metrics = {"mae": None, "model_type": "moving_average", "note": "Fallback vì thiếu thư viện ML"}
        return self

    def predict(self, periods: int = 7) -> pd.DataFrame:
        """
        Dự báo `periods` ngày tiếp theo.
        """
        if self.model is None:
            raise RuntimeError("Model chưa được train. Gọi fit() trước.")

        if self._last_date is None:
            raise ValueError("Thiếu last_date để predict")

        future_dates = [self._last_date + timedelta(days=i + 1) for i in range(periods)]
        future_df = pd.DataFrame({"ds": future_dates})

        if self.model_type_used == "xgboost":
            future_df = self._prepare_features(future_df, is_training=False)
            feature_cols = self._feature_cols or self._get_feature_columns()
            X_future = future_df[feature_cols].fillna(0)

            yhat = self.model.predict(X_future)
            residual_std = self._hist_std

            result = pd.DataFrame({
                "ds": future_dates,
                "yhat": yhat,
                "yhat_lower": np.maximum(0, yhat - 1.28 * residual_std),
                "yhat_upper": yhat + 1.28 * residual_std,
            })
            return result

        elif self.model_type_used == "sklearn":
            future_df = self._prepare_features(future_df, is_training=False)
            feature_cols = self._feature_cols or self._get_feature_columns()
            X_future = future_df[feature_cols].fillna(0)

            yhat = self.model.predict(X_future)
            residual_std = self._hist_std

            result = pd.DataFrame({
                "ds": future_dates,
                "yhat": yhat,
                "yhat_lower": np.maximum(0, yhat - 1.28 * residual_std),
                "yhat_upper": yhat + 1.28 * residual_std,
            })
            return result

        else:  # moving_average
            mean_val = self.model.get("last_7_mean", self.model.get("mean", 0))
            std_est = mean_val * 0.15
            result = pd.DataFrame({
                "ds": future_dates,
                "yhat": [mean_val] * periods,
                "yhat_lower": [mean_val - 1.28 * std_est] * periods,
                "yhat_upper": [mean_val + 1.28 * std_est] * periods,
            })
            return result

    def fit_predict(self, df: pd.DataFrame, periods: int = 7) -> Tuple[pd.DataFrame, dict]:
        """Train + predict trong 1 lần gọi."""
        self.fit(df)
        forecast_df = self.predict(periods)
        return forecast_df, self.metrics
