# TODO List - COMPLETED

## Fix Issues

### 1. ✅ Fixed HistoryOrder.jsx - Rules of Hooks Error
- Moved `useCallback` to the top level of the component so it's always called
- Added alert message when there are no bills: "Chưa có đơn hàng nào để xuất PDF"

### 2. ✅ Fixed Kitchen Status Update Not Working
**Root cause found:** In KitchenColumn.jsx, the `status` prop was being passed as `title` (e.g., "Chờ xử lý") instead of `order.status` (e.g., "Pending"). This caused the status comparison in KitchenCard to always fail.

**Fixes applied:**
- Fixed KitchenColumn.jsx: Changed `status={title}` to `status={order.status}`
- Fixed typo in backend controller: `res.statú(404)` → `res.status(404)`
- Added better error handling in KitchenCard with toast notifications

### 3. Refund functionality
- The refund 404 error may be related to order ID format mismatch between frontend and backend
- The backend expects UUID for bill ID but the frontend might be passing order_id (e.g., "EC248-260305-003")

