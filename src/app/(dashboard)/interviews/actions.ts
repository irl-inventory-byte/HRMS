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

  const raw = formData.get("application_id") as string;
  let application_id = raw;
  let candidate_email: string | null = null;

  if (raw.startsWith("walkin:")) {
    const walkinId = raw.slice("walkin:".length);
    const { data: walkin } = await supabase
      .from("walkin_candidates")
      .select("*")
      .eq("id", walkinId)
      .single();

    if (!walkin) {
      throw new Error("Walk-in candidate not found.");
    }

    // Find or create a job opening matching the position they applied for.
    let { data: openingMatch } = await supabase
      .from("job_openings")
      .select("id")
      .ilike("title", walkin.position_applied)
      .maybeSingle();

    let openingId = openingMatch?.id as string | undefined;
    if (!openingId) {
      const { data: newOpening, error: openingError } = await supabase
        .from("job_openings")
        .insert({ title: walkin.position_applied, vacancies: 1, status: "open" })
        .select("id")
        .single();
      if (openingError || !newOpening) {
        throw new Error("Failed to create a job opening for this walk-in candidate.");
      }
      openingId = newOpening.id;
    }

    // Reuse an existing application for this candidate + opening if one exists.
    const { data: existingApp } = await supabase
      .from("job_applications")
      .select("id, candidate_email")
      .eq("job_opening_id", openingId)
      .eq("candidate_email", walkin.email)
      .maybeSingle();

    if (existingApp) {
      application_id = existingApp.id;
      candidate_email = existingApp.candidate_email;
    } else {
      const { data: newApp, error: appError } = await supabase
        .from("job_applications")
        .insert({
          job_opening_id: openingId,
          candidate_name: walkin.name,
          candidate_email: walkin.email,
          candidate_phone: walkin.phone,
          status: "new",
        })
        .select("id, candidate_email")
        .single();
      if (appError || !newApp) {
        throw new Error("Failed to create an application for this walk-in candidate.");
      }
      application_id = newApp.id;
      candidate_email = newApp.candidate_email;
    }
  } else {
    const { data: app } = await supabase
      .from("job_applications")
      .select("candidate_email")
      .eq("id", application_id)
      .single();
    candidate_email = app?.candidate_email ?? null;
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

  if (error) {
    throw new Error(`Failed to save interview: ${error.message}`);
  }

  revalidatePath("/interviews");
  revalidatePath("/jobs");
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