"use server";

import { createClient } from "@/lib/supabase/server";

export async function selfCheckIn(formData: FormData) {
  const supabase = createClient();

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const position_applied = formData.get("position_applied") as string;

  const { data: existing } = await supabase
    .from("walkin_candidates")
    .select("id")
    .eq("email", email)
    .eq("position_applied", position_applied)
    .neq("queue_status", "done")
    .maybeSingle();

  if (existing) {
    return { success: false, error: "You've already checked in for this position. A team member will be with you shortly." };
  }

  const { error } = await supabase.from("walkin_candidates").insert({
    name: formData.get("name"),
    email,
    phone: formData.get("phone") || null,
    position_applied,
  });

  if (error) {
    return { success: false, error: `Check-in failed: ${error.message}` };
  }

  return { success: true, error: null };
}