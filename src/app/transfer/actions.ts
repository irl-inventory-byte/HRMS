"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fileTransferForm(formData: FormData) {
  const supabase = createClient();

  await supabase.from("transfer_forms").insert({
    employee_id: formData.get("employee_id"),
    new_org_unit: formData.get("new_org_unit") || null,
    new_title: formData.get("new_title") || null,
    new_manager_id: formData.get("new_manager_id") || null,
    reason: formData.get("reason"),
    feedback: formData.get("feedback") || null,
  });

  revalidatePath("/transfer");
}

export async function convertToFullTime(employeeId: string) {
  const supabase = createClient();
  await supabase
    .from("employees")
    .update({ employment_type: "full_time", contract_end: null })
    .eq("id", employeeId);

  revalidatePath("/transfer");
}
