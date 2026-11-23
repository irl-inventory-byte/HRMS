import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAndRole() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { email: null, role: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return { email: user.email ?? null, role: profile?.role ?? null };
}