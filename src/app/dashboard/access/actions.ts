"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileRole(formData: FormData) {
  const id = formData.get("id") as string;
  const role = formData.get("role") as string;

  const supabase = createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);

  revalidatePath("/access");
}

export async function addAllowedUser(formData: FormData) {
  const full_name = formData.get("full_name") as string;
  const email = (formData.get("email") as string).trim().toLowerCase();
  const role = formData.get("role") as string;

  const supabase = createClient();
  await supabase.from("allowed_users").upsert({ full_name, email, role });

  revalidatePath("/access");
}

export async function removeAllowedUser(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = createClient();
  await supabase.from("allowed_users").delete().eq("email", email);
  revalidatePath("/access");
}