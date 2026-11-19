"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitApplication(formData: FormData) {
  const supabase = createClient();

  // The duplicate-rejection logic lives in a DB trigger (see supabase/schema.sql)
  // so it applies no matter which client inserts the row.
  await supabase.from("job_applications").insert({
    job_opening_id: formData.get("job_opening_id"),
    candidate_name: formData.get("candidate_name"),
    candidate_email: formData.get("candidate_email"),
    candidate_phone: formData.get("candidate_phone") || null,
    resume_url: formData.get("resume_url") || null,
  });

  revalidatePath("/jobs");
}

export async function createJobOpening(formData: FormData) {
  const supabase = createClient();
  await supabase.from("job_openings").insert({
    title: formData.get("title"),
    org_unit: formData.get("org_unit"),
    vacancies: Number(formData.get("vacancies") || 1),
  });
  revalidatePath("/jobs");
}
