export type Role =
  | "admin"
  | "hr"
  | "manager"
  | "interviewer"
  | "employee";

export type EmployeeStatus = "active" | "on_leave" | "exited" | "contract_ending";

export interface Employee {
  manager: string;
  id: string;
  emp_id: string;
  name: string;
  title: string;
  org_unit: string;
  manager_id: string | null;
  joining_date: string;
  status: EmployeeStatus;
  contract_end: string | null;
  exit_reason: string | null;
  office_email: string | null;
  personal_email: string | null;
  phone: string | null;
  employment_type: "full_time" | "contract";
  created_at: string;
}

export interface ExitForm {
  id: string;
  employee_id: string;
  filed_by_manager_id: string;
  exit_reason: string;
  last_working_day: string;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface TransferForm {
  id: string;
  employee_id: string;
  new_org_unit: string | null;
  new_title: string | null;
  new_manager_id: string | null;
  reason: string;
  feedback: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface JobOpening {
  id: string;
  title: string;
  org_unit: string;
  vacancies: number;
  status: "open" | "closed";
  created_at: string;
}

export interface JobApplication {
  id: string;
  job_opening_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  resume_url: string | null;
  status: "new" | "in_review" | "rejected" | "duplicate_rejected" | "hired";
  created_at: string;
}

export interface InterviewEntry {
  id: string;
  application_id: string;
  candidate_email: string;
  interviewer_id: string;
  round: number;
  outcome: "pending" | "passed" | "rejected";
  feedback: string | null;
  created_at: string;
}

export interface WalkInCandidate {
  [x: string]: string | null;
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position_applied: string;
  queue_status: "waiting" | "in_progress" | "done";
  created_at: string;
}
