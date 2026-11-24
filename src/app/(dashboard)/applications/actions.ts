"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export async function submitInternalApplication(formData: FormData) {
  const employee_id = formData.get("employee_id") as string;
  const job_opening_id = formData.get("job_opening_id") as string;

  const supabase = createClient();
  await supabase.from("internal_job_applications").insert({ employee_id, job_opening_id });
  revalidatePath("/applications");
}

export async function updateInternalApplicationStatus(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr"].includes(role ?? "")) {
    throw new Error("Only admin or HR can update application results.");
  }

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  const supabase = createClient();
  await supabase.from("internal_job_applications").update({ status }).eq("id", id);
  revalidatePath("/applications");
}