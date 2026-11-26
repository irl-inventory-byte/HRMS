"use server";

import { createClient } from "@/lib/supabase/server";

export async function selfCheckIn(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.from("walkin_candidates").insert({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    position_applied: formData.get("position_applied"),
  });

  if (error) {
    throw new Error(`Check-in failed: ${error.message}`);
  }
}