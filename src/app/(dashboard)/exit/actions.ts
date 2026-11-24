"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export async function fileExitForm(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr", "manager"].includes(role ?? "")) {
    throw new Error("Only admin, HR, or manager can file an offboarding form.");
  }

  const employee_id = formData.get("employee_id") as string;
  const employee_full_name_entered = formData.get("employee_full_name_entered") as string;
  const employee_id_entered = formData.get("employee_id_entered") as string;
  const employee_official_email = formData.get("employee_official_email") as string;
  const reporting_manager_name = formData.get("reporting_manager_name") as string;
  const exit_reason = formData.get("exit_reason") as string;
  const last_working_day = formData.get("last_working_day") as string;
  const delete_gmail_on_lwd = formData.get("delete_gmail_on_lwd") as string;
  const laptop_return_location = formData.get("laptop_return_location") as string;
  const laptop_serial_number = formData.get("laptop_serial_number") as string;
  const has_company_sim = formData.get("has_company_sim") as string;
  const company_sim_mobile_number = formData.get("company_sim_mobile_number") as string;
  const notes = formData.get("notes") as string;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: filerProfile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("id", user?.id)
    .single();

  await supabase.from("exit_forms").insert({
    employee_id,
    filed_by_manager_id: filerProfile?.employee_id ?? employee_id,
    employee_full_name_entered,
    employee_id_entered,
    employee_official_email,
    reporting_manager_name,
    exit_reason,
    last_working_day,
    delete_gmail_on_lwd,
    laptop_return_location,
    laptop_serial_number,
    has_company_sim,
    company_sim_mobile_number,
    notes,
  });

  revalidatePath("/exit");
}