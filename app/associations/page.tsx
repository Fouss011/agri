"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { Card, TopBar, NavLink, Button } from "../ui";

type Assoc = {
  id: string;
  name: string;
  region: string;
  prefecture: string | null;
  contact_whatsapp: string;
  logo_url: string | null;
};

export default function AssociationsPage() {
  const [rows, setRows] = useState<Assoc[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      setStatus("Chargement…");
      const { data, error } = await supabase
        .from("associations")
        .select("id,name,region,prefecture,contact_whatsapp,logo_url")
        .order("created_at", { ascending: false });

      if (error) {
        setStatus(error.message);
        setRows([]);
      } else {
        setStatus("");
        setRows((data || []) as Assoc[]);
      }
    })();
  }, []);

  return (
    <main>
      <TopBar
        title="Associations"
        left={<NavLink href="/">← Retour marché</NavLink>}
        right={<NavLink href="/admin/login">Espace association</NavLink>}
      />

      <Card
        title="Liste des associations"
        subtitle="Fiches publiques + contact WhatsApp. Aucun utilisateur ne peut modifier ces informations côté public."
      >
        {status && <div className="text-sm text-slate-700">{status}</div>}

        <div className="mt-4 grid gap-3">
          {rows.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  {a.logo_url ? (
                    <img
                      src={a.logo_url}
                      alt=""
                      className="h-12 w-12 rounded-2xl border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl border border-slate-200 bg-slate-50" />
                  )}

                  <div>
                    <div className="text-base font-semibold text-slate-900">{a.name}</div>

                    <div className="mt-1 text-sm text-slate-700">
                      {a.region}
                      {a.prefecture ? ` · ${a.prefecture}` : ""}
                    </div>

                    {/* mini texte */}
                    <div className="mt-1 text-xs text-slate-500">
                      Vérifiée (publication association partenaire)
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/associations/${a.id}`}>
                    <Button variant="ghost">Voir la fiche</Button>
                  </Link>
                  <a href={`https://wa.me/${a.contact_whatsapp}`} target="_blank" rel="noreferrer">
                    <Button>WhatsApp</Button>
                  </a>
                </div>
              </div>
            </div>
          ))}

          {rows.length === 0 && !status && (
            <div className="text-sm text-slate-700">Aucune association pour le moment.</div>
          )}
        </div>
      </Card>
    </main>
  );
}
