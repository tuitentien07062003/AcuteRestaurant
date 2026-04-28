# TODO - Payroll HQ Module

## Phase 1: Backend Foundation

### Step 1: Fix payrollCacheService.js
- [x] Thêm MONTHLY_TTL, MONTHLY_SUMMARY_PREFIX
- [x] Fix method trùng lặp setMonthlySummary

### Step 2: Update payrollController.js
- [x] Sửa getMonthlySalarySummary: Tính thêm lương full-time từ base_salary
- [x] Thêm sendPayrollToHQ: Tạo/cập nhật Payroll + PayrollDetail cho tất cả nhân viên, set status SENT
- [x] Thêm getHqPayrolls: Lấy tất cả payroll đã gửi
- [x] Thêm approvePayroll: Cập nhật status SENT → APPROVED

### Step 3: Update Routes
- [x] payrollRoutes.js: Thêm POST /send-to-hq, GET /hq-list, PATCH /:id/approve
- [x] hqRoutes.js: Thêm các route payroll cho HQ (không cần auth)

## Phase 2: Admin Frontend – Send to HQ

### Step 4: Update payrollApi.js (Admin)
- [x] Thêm sendToHQ(month, year, storeId)

### Step 5: Update MonthlySalarySummary.jsx
- [x] Hiển thị thêm nhân viên full-time (thay cột Lương/giờ bằng Lương CB)
- [x] Thêm nút Gửi HQ
- [x] Hiển thị trạng thái Đã gửi HQ / Đã quyết toán

## Phase 3: HQ Frontend – Receive & Settlement

### Step 6: Create hq_frontend/src/api/payrollApi.js
- [x] API gọi đến /acute/hq/payrolls, /acute/hq/payrolls/:id, /acute/hq/payrolls/:id/approve

### Step 7: Create useHQPayrolls.js hook
- [x] Hook lấy danh sách payroll theo tháng/năm

### Step 8: Create HQPayrollTable.jsx
- [x] Bảng hiển thị chi tiết lương: Part-time giữ nguyên, Full-time hiển thị lương cơ bản

### Step 9: Create HQBankSettlementDialog.jsx
- [x] Dialog mô phỏng form dịch vụ ngân hàng
- [x] Nút Xác nhận quyết toán → gọi API approve

### Step 10: Create HQSalaryPage.jsx
- [x] Trang chính chọn tháng/năm, hiển thị danh sách cửa hàng
- [x] Chọn cửa hàng xem chi tiết
- [x] Nút Quyết toán ngân hàng mở dialog
- [x] Sau approve hiển thị trạng thái Đã quyết toán

### Step 11: Update App.jsx
- [x] Thay route /hq/salary từ dummy thành HQSalaryPage

## Complete! ✅
