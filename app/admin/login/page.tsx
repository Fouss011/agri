"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Card, Input, Button, TopBar, NavLink } from "../../ui";
import { uploadAssociationLogo } from "../../lib/uploadAssociationLogo";


export default function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/admin");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);


  async function onLogin() {
    setStatus("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/admin");
    } catch (e: any) {
      setStatus(e?.message || "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <TopBar left={<NavLink href="/">← Accueil</NavLink>} title="Espace Association" />

      <Card
        title="Connexion"
        subtitle="Accès réservé au point focal de l’association (email + mot de passe)."
      >
        <div className="grid gap-3">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <Input
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <Button onClick={onLogin} disabled={loading || !email || !password}>
            {loading ? "Connexion…" : "Se connecter"}
          </Button>

          {status && <div className="text-sm text-rose-700">{status}</div>}

          <div className="text-sm text-slate-700">
            Pas de compte ?{" "}
            <a className="underline" href="/admin/register">
              Créer un compte
            </a>
          </div>

          <div className="text-xs text-slate-500">
            Astuce: si l’inscription est désactivée, crée les comptes dans Supabase → Authentication → Users.
          </div>
        </div>
      </Card>
    </main>
  );
}
