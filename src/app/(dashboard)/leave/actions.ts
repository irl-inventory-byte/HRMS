"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

function diffDays(from: string, to: string) {
  const a = new Date(from);
  const b = new Date(to);
  const days = Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : 1;
}

export async function applyLeave(formData: FormData) {
  const employee_id = formData.get("employee_id") as string;
  const leave_type = formData.get("leave_type") as string;
  const from_date = formData.get("from_date") as string;
  const to_date = formData.get("to_date") as string;
  const reason = formData.get("reason") as string;
  const days = diffDays(from_date, to_date);

  const supabase = createClient();
  await supabase.from("leave_requests").insert({
    employee_id,
    leave_type,
    from_date,
    to_date,
    days,
    reason,
    status: "pending",
  });

  revalidatePath("/leave");
}

export async function updateLeaveStatus(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr", "manager"].includes(role ?? "")) {
    throw new Error("Only admin, HR, or manager can approve/reject leave.");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const supabase = createClient();
  await supabase.from("leave_requests").update({ status }).eq("id", id);

  revalidatePath("/leave");
}