"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWalkIn(formData: FormData) {
  const supabase = createClient();
  await supabase.from("walkin_candidates").insert({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || null,
    position_applied: formData.get("position_applied"),
    source: formData.get("source") || "Walk-in",
  });
  revalidatePath("/walkin");
}

export async function advanceQueue(id: string, status: "in_progress" | "done") {
  const supabase = createClient();
  await supabase.from("walkin_candidates").update({ queue_status: status }).eq("id", id);
  revalidatePath("/walkin");
}