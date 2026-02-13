
export type UserRole = 'customer' | 'agent';

export interface User {
  user_id: string; // LINE User ID
  role: UserRole;
  display_name: string;
  created_at?: string;
}

export interface FreightRequest {
  id?: string;
  customer_id: string;
  pickup_loc: string;
  dropoff_loc: string;
  weight: string;
  cargo_type: string;
  photo_url: string;
  status: 'open' | 'closed';
  created_at?: string;
}

export interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// Global declaration for LIFF SDK loaded via CDN
declare global {
  interface Window {
    liff: any;
  }
}
