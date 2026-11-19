import { Role } from "@/types/hrms";

// Central access map mirroring the Supabase RLS policies (schema.sql).
// UI uses this to hide controls; the database is the real enforcement layer.
export const permissions = {
  editEmployees: (role: Role) => role === "admin" || role === "hr",
  fileExitOrTransfer: (role: Role) =>
    role === "admin" || role === "hr" || role === "manager",
  manageJobs: (role: Role) => role === "admin" || role === "hr",
  recordInterview: (role: Role) =>
    role === "admin" || role === "hr" || role === "interviewer",
  manageWalkins: (role: Role) => role === "admin" || role === "hr",
  viewOnly: (role: Role) => role === "employee",
};
