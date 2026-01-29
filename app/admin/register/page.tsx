"use client";

import { Card, TopBar, NavLink } from "../../ui";

export default function AdminRegister() {
  return (
    <main>
      <TopBar left={<NavLink href="/admin/login">← Retour login</NavLink>} title="Inscription Association" />

      <Card
        title="Inscription désactivée (MVP)"
        subtitle="Pour garder une plateforme crédible, les comptes sont créés manuellement."
      >
        <div className="grid gap-3 text-sm text-slate-700">
          <div>
            ✅ Crée les comptes via : <b>Supabase → Authentication → Users → Add user</b>
          </div>
          <div>
            Ensuite, l’association se connecte sur <b>/admin/login</b> et remplit son profil.
          </div>
          <div className="text-xs text-slate-500">
            (Le “self-signup” sera ajouté plus tard si besoin, avec vérification ONG/État.)
          </div>
        </div>
      </Card>
    </main>
  );
}
