import os
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional


class DataFetcher:
    def __init__(self):
        self.conn_params = {
            "host": os.getenv("PGHOST"),
            "port": os.getenv("PGPORT", "5432"),
            "dbname": os.getenv("PGDATABASE"),
            "user": os.getenv("PGUSER"),
            "password": os.getenv("PGPASSWORD"),
            "sslmode": os.getenv("PGSSLMODE"), # Tùy môi trường, có thể cần bật SSL hoặc không
        }

    def get_connection(self):
        return psycopg2.connect(**self.conn_params)

    def fetch_sales_history(
        self,
        store_id: int,
        history_days: int = 90,
        end_date: Optional[str] = None,
    ) -> pd.DataFrame:
        """
        Lấy lịch sử doanh thu từ bảng sales_summary.
        Trả về DataFrame với cột: ds (date), y (net_sales), bill_count
        """
        if end_date is None:
            end_date = datetime.now().strftime("%Y-%m-%d")

        start_date = (
            datetime.strptime(end_date, "%Y-%m-%d") - timedelta(days=history_days)
        ).strftime("%Y-%m-%d")

        query = """
            SELECT 
                sales_date AS ds,
                COALESCE(net_sales, 0) AS y,
                COALESCE(bill_count, 0) AS bill_count
            FROM sales_summary
            WHERE store_id = %s
              AND sales_date >= %s
              AND sales_date <= %s
            ORDER BY sales_date ASC;
        """

        conn = self.get_connection()
        try:
            df = pd.read_sql_query(
                query, conn, params=(store_id, start_date, end_date)
            )
            # Đảm bảo kiểu dữ liệu đúng
            df["ds"] = pd.to_datetime(df["ds"]).dt.tz_localize(None)
            df["y"] = pd.to_numeric(df["y"], errors="coerce").fillna(0)
            df["bill_count"] = pd.to_numeric(df["bill_count"], errors="coerce").fillna(0).astype(int)
            return df
        finally:
            conn.close()

    def fetch_all_store_ids(self) -> list:
        """Lấy danh sách tất cả store_id có dữ liệu sales_summary."""
        query = "SELECT DISTINCT store_id FROM sales_summary ORDER BY store_id;"
        conn = self.get_connection()
        try:
            with conn.cursor() as cur:
                cur.execute(query)
                rows = cur.fetchall()
                return [r[0] for r in rows]
        finally:
            conn.close()

    def save_forecast_to_db(
        self,
        store_id: int,
        forecast_df: pd.DataFrame,
    ) -> int:
        """
        Lưu forecast vào bảng sales_summary.
        forecast_df phải có cột: ds (date), yhat
        """
        query = """
            INSERT INTO sales_summary (
                id, store_id, sales_date, forecast, created_at
            ) VALUES (
                gen_random_uuid(), %s, %s, %s, NOW()
            )
            ON CONFLICT (store_id, sales_date) DO UPDATE SET
                forecast = EXCLUDED.forecast,
                created_at = EXCLUDED.created_at;
        """
        conn = self.get_connection()
        rows_inserted = 0
        try:
            with conn.cursor() as cur:
                for _, row in forecast_df.iterrows():
                    date_str = pd.to_datetime(row["ds"]).strftime("%Y-%m-%d")
                    cur.execute(query, (store_id, date_str, float(row["yhat"])))
                    rows_inserted += 1
            conn.commit()
            return rows_inserted
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()

