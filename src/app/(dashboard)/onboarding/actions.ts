"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndRole } from "@/lib/current-user";
import { CHECKLIST_ITEMS } from "./checklistItems";

async function requireAdminOrHr() {
  const { role } = await getCurrentUserAndRole();
  if (!["admin", "hr"].includes(role ?? "")) {
    throw new Error("Only admin or HR can manage onboarding.");
  }
}

export async function addOnboardingEntry(formData: FormData) {
  await requireAdminOrHr();

  const name = formData.get("name") as string;
  const position = formData.get("position") as string;
  const start_date = formData.get("start_date") as string;

  const supabase = createClient();
  await supabase.from("onboarding_entries").insert({ name, position, start_date });

  revalidatePath("/onboarding");
}

export async function updateOnboardingEntry(formData: FormData) {
  await requireAdminOrHr();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const position = formData.get("position") as string;
  const start_date = formData.get("start_date") as string;

  const checklistUpdate: Record<string, boolean> = {};
  for (const item of CHECKLIST_ITEMS) {
    checklistUpdate[item.key] = formData.get(item.key) === "on";
  }

  const supabase = createClient();
  await supabase
    .from("onboarding_entries")
    .update({ name, position, start_date, ...checklistUpdate })
    .eq("id", id);

  revalidatePath("/onboarding");
}