import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserAndRole() {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, email: null, role: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to fetch role for user", user.id, profileError.message);
  }

  return {
    user,
    email: user.email ?? null,
    role: profile?.role ?? null,
  };
}