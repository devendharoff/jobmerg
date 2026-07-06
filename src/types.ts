export interface Job {
  id: string;
  title: string;
  company: string;
  logoUrl: string;
  location: string;
  workType: 'Remote' | 'Hybrid' | 'On-site';
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  salaryRange: string;
  experienceRequired: string;
  postedTime: string;
  skills: string[];
  description: string;
  companyAbout: string;
  requirements: string[];
  benefits: string[];
  aiMatchPercent?: number;
  category?: 'Students' | 'Freshers' | 'Graduates' | 'Experienced';
  applyUrl?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  skills: string[];
  experienceYears: number;
  desiredSalary: string;
  resumeText?: string;
  profileCompleteness: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  logoUrl: string;
  appliedDate: string;
  status: 'Applied' | 'Interviewing' | 'Offered' | 'Rejected';
  notes?: string;
}

export interface SalaryInsight {
  role: string;
  averageSalary: string;
  changePercent: number;
  changeDirection: 'up' | 'down';
  skills: string[];
  demandLevel: 'High' | 'Medium' | 'Low';
  trendData: number[]; // salary points over time
}

export interface SavedSearch {
  id: string;
  query: string;
  location: string;
  filters: any;
  dateCreated: string;
}

export type ActiveScreen = 'Landing' | 'Dashboard' | 'SignIn' | 'SignUp';
