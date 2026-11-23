"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordInterview(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("interview_entries").insert({
    application_id: formData.get("application_id"),
    candidate_email: formData.get("candidate_email"),
    interviewer_id: user?.id,
    round: Number(formData.get("round") || 1),
    outcome: formData.get("outcome"),
    feedback: formData.get("feedback") || null,
  });

  revalidatePath("/interviews");
}
