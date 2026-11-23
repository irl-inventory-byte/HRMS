"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

export async function createJobOpening(formData: FormData) {
  const title = formData.get("title") as string;
  const org_unit = formData.get("org_unit") as string;
  const vacancies = Number(formData.get("vacancies")) || 1;

  const supabase = createClient();
  await supabase.from("job_openings").insert({
    title,
    org_unit,
    vacancies,
    status: "open",
  });

  revalidatePath("/jobs");
}

export async function submitApplication(formData: FormData) {
  const job_opening_id = formData.get("job_opening_id") as string;
  const candidate_name = formData.get("candidate_name") as string;
  const candidate_email = (formData.get("candidate_email") as string).trim().toLowerCase();
  const candidate_phone = formData.get("candidate_phone") as string;
  const resume_url = formData.get("resume_url") as string;

  const supabase = createClient();

  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("job_opening_id", job_opening_id)
    .eq("candidate_email", candidate_email)
    .maybeSingle();

  const status = existing ? "duplicate_rejected" : "applied";

  await supabase.from("job_applications").insert({
    job_opening_id,
    candidate_name,
    candidate_email,
    candidate_phone,
    resume_url,
    status,
  });

  revalidatePath("/jobs");
}

export async function closeJobOpening(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (role !== "admin") {
    throw new Error("Only admins can close job openings.");
  }

  const id = formData.get("id") as string;
  const supabase = createClient();
  await supabase.from("job_openings").update({ status: "closed" }).eq("id", id);
  revalidatePath("/jobs");
}

export async function deleteJobOpening(formData: FormData) {
  const { role } = await getCurrentUserAndRole();
  if (role !== "admin") {
    throw new Error("Only admins can delete job openings.");
  }

  const id = formData.get("id") as string;
  const supabase = createClient();
  await supabase.from("job_openings").delete().eq("id", id);
  revalidatePath("/jobs");
}