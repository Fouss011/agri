"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { Card, TopBar, NavLink, Button } from "./ui";

export default function Home() {
  const [rows, setRows] = useState<any[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      setStatus("Chargement…");

      const { data, error } = await supabase
        .from("products")
        .select("id,name,origin,quantity,availability,image_url, associations(id,name,contact_whatsapp,logo_url)")
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        setRows([]);
      } else {
        setStatus("");
        setRows(data || []);
      }
    })();
  }, []);

  return (
    <main>
      <TopBar
        title="Marché (MVP)"
        right={
          <div className="flex items-center gap-4">
            <NavLink href="/associations">Associations</NavLink>
            <NavLink href="/about">Présentation</NavLink>
            <NavLink href="/admin/login">Espace association</NavLink>
          </div>
        }
      />

      <Card
        title="Produits disponibles"
        subtitle="Contact direct via WhatsApp de l’association — pas de paiement dans le MVP."
      >
        {status && <div className="text-sm text-slate-700">{status}</div>}

        <div className="mt-4 grid gap-3">
          {rows.map((r) => {
            const a = r.associations;
            const assocId = a?.id as string | undefined;

            return (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt=""
                        className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50" />
                    )}

                    <div>
                      <div className="text-base font-semibold text-slate-900">{r.name}</div>

                      <div className="mt-1 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700">
                        Disponible
                      </div>

                      <div className="mt-2 text-sm text-slate-700">
                        Origine: {r.origin || "-"} · Quantité: {r.quantity || "-"} · Dispo:{" "}
                        {r.availability || "-"}
                      </div>

                      <div className="mt-2 text-sm text-slate-700">
                        Association:{" "}
                        {assocId ? (
                          <Link className="font-medium underline" href={`/associations/${assocId}`}>
                            {a?.name || "-"}
                          </Link>
                        ) : (
                          <span className="font-medium">{a?.name || "-"}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assocId && (
                      <Link href={`/associations/${assocId}`}>
                        <Button variant="ghost">Voir la fiche</Button>
                      </Link>
                    )}
                    <a
                      href={`https://wa.me/${a?.contact_whatsapp || ""}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button>WhatsApp</Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}

          {rows.length === 0 && !status && (
            <div className="text-sm text-slate-700">
              Aucun produit pour le moment. (Ajoute-en via l’espace association.)
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}
