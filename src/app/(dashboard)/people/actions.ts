"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";

async function requireAdminOrHr() {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr"].includes(role ?? "")) {
    throw new Error("Only admin or HR can manage the people registry.");
  }
}

export async function addPerson(formData: FormData) {
  await requireAdminOrHr();
  const full_name = formData.get("full_name") as string;
  const role = formData.get("role") as string;
  const city = formData.get("city") as string;
  const email = (formData.get("email") as string).trim().toLowerCase();
  const mobile = formData.get("mobile") as string;

  const supabase = createClient();
  const { error } = await supabase.from("people").insert({ full_name, role, city, email, mobile });

  if (error) {
    throw new Error(`Failed to add person: ${error.message}`);
  }

  revalidatePath("/people");
}

export async function deactivatePerson(formData: FormData) {
  await requireAdminOrHr();
  const id = formData.get("id") as string;
  const supabase = createClient();
  const { error } = await supabase.from("people").update({ status: "inactive" }).eq("id", id);

  if (error) {
    throw new Error(`Failed to deactivate person: ${error.message}`);
  }

  revalidatePath("/people");
}