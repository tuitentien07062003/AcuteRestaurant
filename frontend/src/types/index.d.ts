export interface MenuCategory { id: number; code: string; name: string; }
export interface MenuItem { id: string; name: string; price: number; image_url: string; active: boolean; }
export interface BillOrder { id: string; order_id: string; payment_method: string; status: string; total_amount: number; discount_amount?: number; created_at: string; }
export interface User { id: string; username: string; role: string; }
// add additional types as needed
