import { supabase } from "./supabase";

export async function getUserIdOrNull(): Promise<string | null> {
  // 1) Essaye session directe
  const { data: s } = await supabase.auth.getSession();
  const uid = s.session?.user?.id ?? null;
  if (uid) return uid;

  // 2) Fallback: récupère l'utilisateur (parfois plus fiable en dev)
  const { data: u } = await supabase.auth.getUser();
  return u.user?.id ?? null;
}
