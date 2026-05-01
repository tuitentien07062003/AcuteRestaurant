const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
const REQUEST_TIMEOUT = 15000; // 15 giây

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Gọi AI Service để lấy dự báo doanh thu
 * @param {number} storeId
 * @param {number} days - Số ngày dự báo (mặc định 7)
 * @param {number} historyDays - Số ngày lịch sử (mặc định 90)
 */
export const getForecastFromAI = async (storeId, days = 7, historyDays = 90) => {
  try {
    const data = await fetchWithTimeout(
      `${AI_SERVICE_URL}/forecast/daily`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          days,
          history_days: historyDays,
        }),
      }
    );
    return data;
  } catch (error) {
    console.error("[forecastService] Gọi AI Service thất bại:", error.message);
    // Fallback: Moving Average từ Node.js
    return getFallbackForecast(storeId, days);
  }
};

/**
 * Trigger train model thủ công
 * @param {number} storeId
 */
export const triggerForecastTraining = async (storeId) => {
  try {
    const data = await fetchWithTimeout(
      `${AI_SERVICE_URL}/forecast/train`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId }),
      }
    );
    return data;
  } catch (error) {
    console.error("[forecastService] Trigger training thất bại:", error.message);
    throw new Error("Không thể kết nối AI Service để train model");
  }
};

/**
 * Fallback: Group-by DayOfWeek khi AI Service không khả dụng
 * Tính trung bình doanh thu theo từng thứ trong tuần từ lịch sử 30 ngày
 */
const getFallbackForecast = async (storeId, days) => {
  try {
    const { sequelize } = await import("../config/db.js");

    // Lấy trung bình doanh thu theo từng thứ trong tuần (0=Chủ Nhật, 6=Thứ 7)
    const [dowRows] = await sequelize.query(
      `
      SELECT 
        EXTRACT(DOW FROM sales_date) as dow,
        AVG(net_sales) as avg_sales,
        COUNT(*) as cnt
      FROM sales_summary
      WHERE store_id = ?
        AND sales_date >= CURRENT_DATE - INTERVAL '30 days'
        AND sales_date < CURRENT_DATE
      GROUP BY EXTRACT(DOW FROM sales_date)
      ORDER BY dow;
      `,
      { replacements: [storeId] }
    );

    // Nếu không có dữ liệu group-by, fallback về MA đơn giản
    if (!dowRows || dowRows.length === 0) {
      const [rows] = await sequelize.query(
        `
        SELECT AVG(net_sales) as avg_sales
        FROM sales_summary
        WHERE store_id = ?
          AND sales_date >= CURRENT_DATE - INTERVAL '7 days'
          AND sales_date < CURRENT_DATE
        `,
        { replacements: [storeId] }
      );
      const avg = parseFloat(rows[0]?.avg_sales) || 0;
      const std = avg * 0.15;
      const forecast = [];
      const today = new Date();
      for (let i = 1; i <= days; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        forecast.push({
          date: d.toISOString().split("T")[0],
          yhat: Math.round(avg),
          yhat_lower: Math.round(Math.max(0, avg - 1.28 * std)),
          yhat_upper: Math.round(avg + 1.28 * std),
        });
      }
      return {
        store_id: storeId,
        forecast,
        metrics: {
          mae: null,
          mape: null,
          rows_used: 7,
          model_type: "moving_average_fallback",
          note: "AI Service không khả dụng, dùng fallback MA (không có dữ liệu DOW)",
        },
      };
    }

    // Tạo map dow -> avg_sales
    const dowMap = {};
    let globalSum = 0;
    let globalCnt = 0;
    for (const r of dowRows) {
      const dow = parseInt(r.dow);
      const avg = parseFloat(r.avg_sales) || 0;
      dowMap[dow] = avg;
      globalSum += avg;
      globalCnt++;
    }
    const globalAvg = globalCnt > 0 ? globalSum / globalCnt : 0;
    const std = globalAvg * 0.15;

    // Tính toán forecast theo từng ngày
    const forecast = [];
    const today = new Date();
    for (let i = 1; i <= days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dow = d.getDay(); // 0=CN, 1=T2, ..., 6=T7
      const yhat = Math.round(dowMap[dow] || globalAvg);
      forecast.push({
        date: d.toISOString().split("T")[0],
        yhat,
        yhat_lower: Math.round(Math.max(0, yhat - 1.28 * std)),
        yhat_upper: Math.round(yhat + 1.28 * std),
      });
    }

    return {
      store_id: storeId,
      forecast,
      metrics: {
        mae: null,
        mape: null,
        rows_used: dowRows.reduce((sum, r) => sum + parseInt(r.cnt), 0),
        model_type: "dow_average_fallback",
        note: "AI Service không khả dụng, dùng fallback theo thứ trong tuần",
      },
    };
  } catch (err) {
    console.error("[forecastService] Fallback cũng thất bại:", err.message);
    throw new Error("Không thể tạo dự báo doanh thu");
  }
};

