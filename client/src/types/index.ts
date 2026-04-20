export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  type: 'individual' | 'dupla';
  target_value: number;
  unit: string;
  deadline: string;
  status: 'active' | 'completed' | 'cancelled';
  created_by: number;
  partner_id?: number;
  partner_status?: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  creator_name?: string;
  partner_name?: string;
  current_value: number;
  percentage: number;
}

export interface ProgressEntry {
  id: number;
  goal_id: number;
  user_id: number;
  value: number;
  note?: string;
  date: string;
  created_at: string;
  user_name?: string;
}

export interface GoalDetail extends Goal {
  entries: ProgressEntry[];
}
