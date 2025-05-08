export enum UserRole {
  ADMIN = 'admin',
  CURATOR = 'curator',
}

export interface UserProfile {
  avatarUrl?: string;
  contactLinks?: string[];
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
  isActive: boolean;
  workers?: Worker[];
  profile?: UserProfile;
}

export interface Worker {
  id: number;
  username: string;
  tag?: string;
  createdAt: string;
  curator: User;
  income?: number;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface WorkerStats {
  id: number;
  username: string;
  tag?: string;
  curatorName: string;
  daysInTeam: number;
  createdAt: string;
}

export interface CuratorStats {
  curatorName: string;
  totalWorkers: number;
  daysInTeam: number;
  chartData: {
    date: string;
    count: number;
  }[];
}

export interface GeneralStats {
  totalCurators: number;
  totalWorkers: number;
}

export interface SearchResult {
  users: User[];
}

export interface WorkerWithCodes extends Worker {
  todayCodesCount: number;
}

export interface CodeHourlyStats {
  hour: number;
  total: number;
}

export interface TopWorker {
  id: number;
  username: string;
  tag: string;
  codesCount: number;
  curatorName: string;
}

export interface WorkerCodeStats {
  worker: TopWorker;
  hourlyData: CodeHourlyStats[];
}

export interface EarningStats {
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  income: number;
}

export interface AttendanceRecord {
  id: number;
  date: string;
  present: boolean;
  reason?: string;
  workerId: number;
}

export interface WorkerAttendance {
  records: AttendanceRecord[];
}

export interface FinanceBank {
  id: number;
  amount: number;
  weekStart: string;
  weekEnd: string;
  updatedAt: string;
}

export interface FinanceTransaction {
  id: number;
  userId: number;
  username: string;
  amount: number;
  reason: string;
  createdAt: string;
}

export interface FinanceWeekStats {
  totalAmount: number;
  totalTransactions: number;
  dailyStats: {
    date: string;
    totalAmount: number;
    transactionsCount: number;
  }[];
} 