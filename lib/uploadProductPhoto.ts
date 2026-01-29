import { supabase } from "./supabase";

export async function uploadProductPhoto(params: {
  associationId: string;
  file: any; // File côté navigateur
}) {
  const { associationId, file } = params;

  // extension depuis mime-type
  const mime = (file?.type || "").toLowerCase();
  const ext =
    mime.includes("png") ? "png" :
    mime.includes("webp") ? "webp" :
    mime.includes("jpeg") ? "jpg" :
    mime.includes("jpg") ? "jpg" :
    "jpg";

  // nom unique
  const stamp = Date.now();
  const rand = Math.floor(Math.random() * 100000);
  const path = `${associationId}/${stamp}-${rand}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("product-photos")
    .upload(path, file, { upsert: false });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
  return data.publicUrl;
}
