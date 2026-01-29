import { supabase } from "./supabase";

export async function uploadAssociationLogo(params: {
  associationId: string;
  file: any; // File côté navigateur
}) {
  const { associationId, file } = params;

  const mime = (file?.type || "").toLowerCase();
  const ext =
    mime.includes("png") ? "png" :
    mime.includes("webp") ? "webp" :
    mime.includes("jpeg") ? "jpg" :
    mime.includes("jpg") ? "jpg" :
    "jpg";

  const path = `${associationId}/logo.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("association-logos")
    .upload(path, file, { upsert: true });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("association-logos").getPublicUrl(path);

  // IMPORTANT: cache-busting
  const v = Date.now();
  return `${data.publicUrl}?v=${v}`;
}
