export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
export type UserRole = 'user';

export type ProjectCategory = 'PMO' | 'SDA';
export type ProjectStatus = 'Progress' | 'Hold' | 'Drop' | 'Pengujian Done' | 'Project Done';

export interface User {
  id: string;
  username: string;
  password: string; 
  role: UserRole;
}

export interface Issue {
  id: string;
  date: string; // Date Open (YYYY-MM-DD)
  caseNumber: string; 
  testCase: string; 
  description: string;
  actualResult: string; // New field
  expectedResult: string; // New field
  correction?: string; // Hasil Perbaikan
  correctiveAction?: string; // Legacy/Optional
  status: IssueStatus;
  dateClosed?: string; // Date Close (YYYY-MM-DD)
}

export interface ProjectData {
  id: string;
  name: string;
  owner: string; // username of the project owner
  category: ProjectCategory;
  projectStatus: ProjectStatus;
  progress: number; // 0 to 100
  startDate: string; // New field for Project Start Date
  issues: Issue[];
}

export interface DashboardMetrics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  closedIssues: number;
  completionRate: number;
}