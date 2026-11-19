"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function fileExitForm(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("employee_id")
    .eq("id", user.id)
    .single();

  await supabase.from("exit_forms").insert({
    employee_id: formData.get("employee_id"),
    filed_by_manager_id: profile?.employee_id,
    exit_reason: formData.get("exit_reason"),
    last_working_day: formData.get("last_working_day"),
    notes: formData.get("notes") || null,
  });

  revalidatePath("/exit");
}
