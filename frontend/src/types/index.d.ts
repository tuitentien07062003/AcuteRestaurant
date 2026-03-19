export interface MenuCategory { id: number; code: string; name: string; }
export interface MenuItem { id: string; name: string; price: number; image_url: string; active: boolean; }
export interface BillOrder { id: string; order_id: string; payment_method: string; status: string; total_amount: number; discount_amount?: number; created_at: string; }
export interface User { id: string; username: string; role: string; }

export interface Employee {
  id: string;
  full_name: string;
  phone: string;
  role: 'SM' | 'SUP' | 'CREW' | 'CREW_TRAINER' | 'CREW_LEADER' | 'HQ';
  type: 'full-time' | 'part-time';
  active: boolean;
  base_salary?: number;
  hourly_rate?: number;
  contract_end?: string;
  created_at?: string;
}

export interface AdminState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}
