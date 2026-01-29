"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Card, TopBar, NavLink, Button } from "../../ui";

type Assoc = {
  id: string;
  name: string;
  region: string;
  prefecture: string | null;
  contact_whatsapp: string;
  logo_url: string | null;
};

type Prod = {
  id: string;
  name: string;
  origin: string | null;
  quantity: string | null;
  availability: string | null;
  image_url: string | null;
};

export default function AssociationDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [assoc, setAssoc] = useState<Assoc | null>(null);
  const [products, setProducts] = useState<Prod[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!id) return;

    (async () => {
      setStatus("Chargement…");

      const { data: aData, error: aErr } = await supabase
        .from("associations")
        .select("id,name,region,prefecture,contact_whatsapp,logo_url")
        .eq("id", id)
        .single();

      if (aErr) {
        setStatus(aErr.message);
        return;
      }

      setAssoc(aData as Assoc);

      const { data: pData, error: pErr } = await supabase
        .from("products")
        .select("id,name,origin,quantity,availability,image_url")
        .eq("association_id", id)
        .order("created_at", { ascending: false });

      if (pErr) {
        setStatus(pErr.message);
        return;
      }

      setProducts((pData || []) as Prod[]);
      setStatus("");
    })();
  }, [id]);

  return (
    <main>
      <TopBar
        title="Fiche association"
        left={<NavLink href="/associations">← Retour associations</NavLink>}
        right={<NavLink href="/">Marché</NavLink>}
      />

      {status && <div className="text-sm text-slate-700">{status}</div>}

      {assoc && (
        <Card
          title={assoc.name}
          subtitle={`${assoc.region}${assoc.prefecture ? ` · ${assoc.prefecture}` : ""}`}
        >
          <div className="flex items-center gap-3">
            {assoc.logo_url ? (
              <img
                src={assoc.logo_url}
                alt=""
                className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50" />
            )}

            <div>
              <div className="text-xs text-slate-500">
                Vérifiée (publication association partenaire)
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Informations fournies par l’association. Vérifie par WhatsApp avant déplacement.
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a href={`https://wa.me/${assoc.contact_whatsapp}`} target="_blank" rel="noreferrer">
              <Button>Contacter WhatsApp</Button>
            </a>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Card title="Produits publiés" subtitle="Disponibilités indiquées par l’association.">
          <div className="grid gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex gap-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt=""
                      className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50" />
                  )}

                  <div>
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="mt-1 text-sm text-slate-700">
                      Origine: {p.origin || "-"} · Quantité: {p.quantity || "-"} · Dispo:{" "}
                      {p.availability || "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-sm text-slate-700">Aucun produit publié.</div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
