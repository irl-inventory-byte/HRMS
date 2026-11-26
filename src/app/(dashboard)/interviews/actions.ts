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

  const rawId = formData.get("application_id") as string;
  let application_id: string | null = null;
  let candidate_email: string | null = null;

  if (rawId.startsWith("walkin:")) {
    const walkinId = rawId.replace("walkin:", "");
    const { data: w, error: wErr } = await supabase
      .from("walkin_candidates")
      .select("email")
      .eq("id", walkinId)
      .single();
    if (wErr || !w) throw new Error("Could not find that walk-in candidate.");
    candidate_email = w.email;
    application_id = null;
  } else {
    application_id = rawId;
    const { data: app, error: appErr } = await supabase
      .from("job_applications")
      .select("candidate_email")
      .eq("id", application_id)
      .single();
    if (appErr || !app) throw new Error("Could not find that application.");
    candidate_email = app.candidate_email;
  }

  const { error } = await supabase.from("interview_entries").insert({
    application_id,
    candidate_email,
    interviewer_id: user?.id,
    round: Number(formData.get("round")) || 1,
    interview_date: formData.get("interview_date") as string,
    outcome: formData.get("outcome") as string,
    feedback: formData.get("feedback") as string,
  });
  if (error) throw new Error(`Failed to save interview: ${error.message}`);

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
  const round = Number(formData.get("round")) || 1;
  const interview_date = formData.get("interview_date") as string;

  const supabase = createClient();
  const { error } = await supabase
    .from("interview_entries")
    .update({ outcome, feedback, round, interview_date })
    .eq("id", id);
  if (error) throw new Error(`Failed to update interview: ${error.message}`);
  revalidatePath("/interviews");
}