export enum UserRole {
  ADMIN = 'admin',
  CURATOR = 'curator',
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  createdAt: string;
  workers?: Worker[];
}

export interface Worker {
  id: number;
  username: string;
  tag?: string;
  createdAt: string;
  curator: User;
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