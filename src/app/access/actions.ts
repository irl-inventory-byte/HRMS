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