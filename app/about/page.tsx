import { Card, TopBar, NavLink } from "../ui";

export default function About() {
  return (
    <main>
      <TopBar title="Présentation" left={<NavLink href="/">← Retour marché</NavLink>} />

      <Card title="Plateforme de mise en relation agricole (MVP)" subtitle="Simple, traçable, orientée terrain.">
        <div className="space-y-3 text-sm text-slate-700">
          <p><span className="font-medium">Objectif :</span> connecter producteurs (via associations) et acheteurs urbains.</p>
          <p><span className="font-medium">Rôle des associations :</span> publier des produits vérifiés et servir de point focal WhatsApp.</p>
          <p><span className="font-medium">Traçabilité :</span> chaque produit est rattaché à une association identifiable.</p>
          <p><span className="font-medium">MVP :</span> pas de paiement intégré, pas de logistique obligatoire — on valide d’abord le besoin.</p>
          <p><span className="font-medium">Utilité ONG/État :</span> structurer l’information, améliorer l’accès au marché, réduire l’asymétrie d’information.</p>
        </div>
      </Card>
    </main>
  );
}
