"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export async function addEmployee(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr"].includes(role ?? "")) {
    throw new Error("Only admins or HR can add employees.");
  }

  const supabase = createClient();

  const emp_id = formData.get("emp_id") as string;
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  const org_unit = formData.get("org_unit") as string;
  const manager = formData.get("manager") as string;
  const joining_date = formData.get("joining_date") as string;
  const status = (formData.get("status") as string) || "active";
  const contract_end = (formData.get("contract_end") as string) || null;
  const exit_reason = (formData.get("exit_reason") as string) || null;
  const office_email = (formData.get("office_email") as string) || null;
  const personal_email = (formData.get("personal_email") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  await supabase.from("employees").insert({
    emp_id,
    name,
    title,
    org_unit,
    manager,
    joining_date,
    status,
    contract_end,
    exit_reason,
    office_email,
    personal_email,
    phone,
  });

  revalidatePath("/employees");
}