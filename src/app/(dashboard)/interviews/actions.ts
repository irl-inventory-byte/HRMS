"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export async function recordInterview(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr", "interviewer"].includes(role ?? "")) {
    throw new Error("Only admin, HR, or interviewer can log interviews.");
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const application_id = formData.get("application_id") as string;
  const { data: app } = await supabase.from("job_applications").select("candidate_email").eq("id", application_id).single();

  await supabase.from("interview_entries").insert({
    application_id,
    candidate_email: app?.candidate_email,
    interviewer_id: user?.id,
    round: Number(formData.get("round")) || 1,
    interview_date: formData.get("interview_date") as string,
    outcome: formData.get("outcome") as string,
    feedback: formData.get("feedback") as string,
  });

  revalidatePath("/interviews");
}

export async function updateInterviewOutcome(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr", "interviewer"].includes(role ?? "")) {
    throw new Error("Only admin, HR, or interviewer can update interviews.");
  }

  const id = formData.get("id") as string;
  const outcome = formData.get("outcome") as string;
  const feedback = formData.get("feedback") as string;

  const supabase = createClient();
  await supabase.from("interview_entries").update({ outcome, feedback }).eq("id", id);
  revalidatePath("/interviews");
}