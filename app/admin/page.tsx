"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Card, Input, Button, TopBar, NavLink } from "../ui";
import { getUserIdOrNull } from "../../lib/requireSession";
import { uploadAssociationLogo } from "../../lib/uploadAssociationLogo";
import { uploadProductPhoto } from "../../lib/uploadProductPhoto";

type Assoc = {
  id: string;
  name: string;
  region: string;
  prefecture: string | null;
  contact_whatsapp: string;
  owner_user_id: string | null;
  logo_url: string | null;
};

type Prod = {
  id: string;
  name: string;
  origin: string | null;
  quantity: string | null;
  availability: string | null;
  association_id: string;
  image_url: string | null;
};

function normalizeWhatsapp(input: string) {
  return (input || "").replace(/[^0-9]/g, "");
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [assoc, setAssoc] = useState<Assoc | null>(null);
  const [products, setProducts] = useState<Prod[]>([]);

  // Association form
  const [aName, setAName] = useState("");
  const [aRegion, setARegion] = useState("");
  const [aPref, setAPref] = useState("");
  const [aWa, setAWa] = useState("");

  // Logo upload UI
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // Product form
  const [pName, setPName] = useState("");
  const [pOrigin, setPOrigin] = useState("");
  const [pQty, setPQty] = useState("");
  const [pAvail, setPAvail] = useState("");
  const [pPhoto, setPPhoto] = useState<File | null>(null);
  const [pPhotoPreviewUrl, setPPhotoPreviewUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const canCreateProduct = useMemo(() => !!assoc?.id, [assoc?.id]);

  async function requireSession() {
    const uid = await getUserIdOrNull();
    if (!uid) {
      router.replace("/admin/login");
      return null;
    }
    setSessionUserId(uid);
    return uid;
  }

  async function loadAssocAndProducts(uid: string) {
    const { data: aData, error: aErr } = await supabase
      .from("associations")
      .select("id,name,region,prefecture,contact_whatsapp,owner_user_id,logo_url")
      .eq("owner_user_id", uid)
      .maybeSingle();

    if (aErr) throw aErr;

    if (aData) {
      setAssoc(aData as Assoc);
      setAName(aData.name || "");
      setARegion(aData.region || "");
      setAPref(aData.prefecture || "");
      setAWa(aData.contact_whatsapp || "");

      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("id,name,origin,quantity,availability,association_id,image_url")
        .eq("association_id", aData.id)
        .order("created_at", { ascending: false });

      if (pErr) throw pErr;
      setProducts((pData || []) as Prod[]);
    } else {
      setAssoc(null);
      setProducts([]);
    }
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setStatus("");
      try {
        const uid = await requireSession();
        if (!uid) return;
        if (cancelled) return;
        await loadAssocAndProducts(uid);
      } catch (e: any) {
        if (!cancelled) setStatus(e?.message || "Erreur");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onLogoutToLogin() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  async function onPickLogo(file: File | null) {
    if (!file) return;

    if (!assoc?.id || !sessionUserId) {
      setStatus("Crée d’abord le profil association avant d’ajouter un logo.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus("Logo trop lourd (max 2MB).");
      return;
    }

    // preview immédiat
    const temp = URL.createObjectURL(file);
    setLogoPreviewUrl(temp);

    try {
      setLogoUploading(true);
      setStatus("Upload logo…");

      const url = await uploadAssociationLogo({ associationId: assoc.id, file });

      const { error } = await supabase
        .from("associations")
        .update({ logo_url: url })
        .eq("id", assoc.id)
        .eq("owner_user_id", sessionUserId);

      if (error) throw error;

      // maj locale immédiate
      setAssoc((prev) => (prev ? { ...prev, logo_url: url } : prev));

      setStatus("✅ Logo mis à jour");
    } catch (e: any) {
      setStatus(e?.message || "Erreur upload logo (policy/bucket?)");
    } finally {
      setLogoUploading(false);
    }
  }

  async function onUpsertAssociation() {
    if (!sessionUserId) return;
    setStatus("");

    const payload = {
      owner_user_id: sessionUserId,
      name: aName.trim(),
      region: aRegion.trim(),
      prefecture: aPref.trim() || null,
      contact_whatsapp: normalizeWhatsapp(aWa),
    };

    if (!payload.name || !payload.region || !payload.contact_whatsapp) {
      setStatus("Nom, région et WhatsApp sont obligatoires");
      return;
    }

    try {
      if (assoc?.id) {
        const { error } = await supabase
          .from("associations")
          .update(payload)
          .eq("id", assoc.id)
          .eq("owner_user_id", sessionUserId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("associations")
          .insert(payload)
          .select("id,name,region,prefecture,contact_whatsapp,owner_user_id,logo_url")
          .single();

        if (error) throw error;
        setAssoc(data as Assoc);
      }

      await loadAssocAndProducts(sessionUserId);
      setStatus("✅ Profil association enregistré");
    } catch (e: any) {
      setStatus(e?.message || "Erreur enregistrement association");
    }
  }

  function onPickProductPhoto(file: File | null) {
    setPPhoto(file);
    if (!file) {
      setPPhotoPreviewUrl(null);
      return;
    }
    setPPhotoPreviewUrl(URL.createObjectURL(file));
    setStatus("✅ Photo attachée au produit (elle sera upload au clic sur Ajouter)");
  }

  async function onAddProduct() {
    if (!assoc?.id) return;
    setStatus("");

    const name = pName.trim();
    if (!name) {
      setStatus("Nom du produit obligatoire");
      return;
    }

    try {
      let imageUrl: string | null = null;

      if (pPhoto) {
        if (pPhoto.size > 3 * 1024 * 1024) {
          setStatus("Photo trop lourde (max 3MB).");
          return;
        }
        setPhotoUploading(true);
        setStatus("Upload photo produit…");
        imageUrl = await uploadProductPhoto({ associationId: assoc.id, file: pPhoto });
      }

      const payload = {
        association_id: assoc.id,
        name,
        origin: pOrigin.trim() || null,
        quantity: pQty.trim() || null,
        availability: pAvail.trim() || null,
        image_url: imageUrl,
      };

      const { error } = await supabase.from("products").insert(payload);
      if (error) throw error;

      setPName("");
      setPOrigin("");
      setPQty("");
      setPAvail("");
      setPPhoto(null);
      setPPhotoPreviewUrl(null);

      await loadAssocAndProducts(sessionUserId!);
      setStatus("✅ Produit ajouté");
    } catch (e: any) {
      setStatus(e?.message || "Erreur ajout produit (policy/bucket?)");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function onDeleteProduct(id: string) {
    if (!assoc?.id) return;
    setStatus("");

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("association_id", assoc.id);

      if (error) throw error;

      await loadAssocAndProducts(sessionUserId!);
      setStatus("✅ Produit supprimé");
    } catch (e: any) {
      setStatus(e?.message || "Erreur suppression");
    }
  }

  if (loading) return <main>Chargement…</main>;

  return (
    <main>
      <TopBar
        title="Dashboard Association"
        left={
          <div className="flex items-center gap-4">
            <NavLink href="/">← Accueil</NavLink>
            <button className="text-sm text-slate-700 underline" onClick={onLogoutToLogin}>
              Changer de compte
            </button>
          </div>
        }
        right={
          <Button variant="ghost" onClick={onLogoutToLogin}>
            Déconnexion
          </Button>
        }
      />

      {status && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {status}
        </div>
      )}

      <div className="grid gap-6">
        <Card title="1) Profil association" subtitle="Ces infos sont visibles côté public. Remplis d’abord ce bloc.">
          {/* Logo preview */}
          <div className="mb-3 flex items-center gap-3">
            {(logoPreviewUrl || assoc?.logo_url) ? (
              <img
                src={logoPreviewUrl || assoc?.logo_url || ""}
                alt="Logo association"
                className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50" />
            )}
            <div className="text-xs text-slate-500">Logo visible côté public</div>
          </div>

          <div className="mb-3">
            <label className="text-sm font-medium text-slate-700">Logo (optionnel)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="mt-1 block w-full text-sm"
              onChange={(e) => onPickLogo(e.target.files?.[0] || null)}
              disabled={logoUploading}
            />
            <div className="mt-1 text-xs text-slate-500">
              PNG/JPG/WEBP · max 2MB · remplace l’ancien logo
            </div>
          </div>

          <div className="grid gap-3">
            <Input placeholder="Nom de l’association" value={aName} onChange={(e) => setAName(e.target.value)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Région" value={aRegion} onChange={(e) => setARegion(e.target.value)} />
              <Input placeholder="Préfecture (optionnel)" value={aPref} onChange={(e) => setAPref(e.target.value)} />
            </div>
            <Input placeholder="WhatsApp (ex: 22890123456)" value={aWa} onChange={(e) => setAWa(e.target.value)} />

            <div className="flex items-center gap-2">
              <Button onClick={onUpsertAssociation}>{assoc?.id ? "Mettre à jour" : "Créer le profil"}</Button>
            </div>
          </div>
        </Card>

        <Card title="2) Produits" subtitle="Ajoute des produits; ils apparaîtront sur la page d’accueil.">
          {!canCreateProduct ? (
            <div className="text-sm text-slate-600">Crée d’abord le profil association pour publier des produits.</div>
          ) : (
            <>
              <div className="grid gap-3">
                <Input placeholder="Nom du produit (ex: Igname)" value={pName} onChange={(e) => setPName(e.target.value)} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Origine (village / zone)" value={pOrigin} onChange={(e) => setPOrigin(e.target.value)} />
                  <Input placeholder="Quantité (ex: 10 sacs / 200kg)" value={pQty} onChange={(e) => setPQty(e.target.value)} />
                </div>
                <Input placeholder="Disponibilité (ex: semaine prochaine)" value={pAvail} onChange={(e) => setPAvail(e.target.value)} />

                {/* Photo produit */}
                <div className="flex items-center gap-3">
                  {pPhotoPreviewUrl ? (
                    <img src={pPhotoPreviewUrl} alt="" className="h-14 w-14 rounded-xl border border-slate-200 object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50" />
                  )}

                  <div className="w-full">
                    <label className="text-sm font-medium text-slate-700">Photo produit (optionnel)</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="mt-1 block w-full text-sm"
                      onChange={(e) => onPickProductPhoto((e.target.files?.[0] as File) || null)}
                      disabled={photoUploading}
                    />
                    <div className="mt-1 text-xs text-slate-500">PNG/JPG/WEBP · max 3MB</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={onAddProduct} disabled={photoUploading}>
                    {photoUploading ? "Upload…" : "Ajouter"}
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {products.map((p) => (
                  <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="h-14 w-14 rounded-xl border border-slate-200 object-cover" />
                        ) : (
                          <div className="h-14 w-14 rounded-xl border border-slate-200 bg-slate-50" />
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="mt-1 text-sm text-slate-700">
                            Origine: {p.origin || "-"} · Quantité: {p.quantity || "-"} · Dispo: {p.availability || "-"}
                          </div>
                        </div>
                      </div>
                      <Button variant="danger" onClick={() => onDeleteProduct(p.id)}>Supprimer</Button>
                    </div>
                  </div>
                ))}

                {products.length === 0 && <div className="text-sm text-slate-600">Aucun produit publié.</div>}
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
