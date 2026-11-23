"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

// ...keep your existing submitApplication and createJobOpening functions above...

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