# PRESTIGE CONCIERGERIE — site web

Site de conciergerie automobile (location de véhicules, de l'économique à la supercar) — Belgique, Nord de la France, Paris.

**Stack** : Next.js 16 (App Router, SSG pour le SEO) · React 19 · TypeScript · Tailwind CSS · composants shadcn/ui (`components/ui`) · framer-motion · lucide-react.

```bash
npm install
cp .env.example .env.local   # renseigner WhatsApp, e-mail, Google Calendar
npm run dev                  # http://localhost:3000
npm run build && npm start   # production
```

## Parcours

| Élément | Fichier |
|---|---|
| Gate vidéo bloquant (3 choix, mémorisé pour la session) | `components/gate/entry-gate.tsx` |
| Header sticky + slide tabs + bouton Réserver, menu mobile | `components/layout/header.tsx`, `components/ui/slide-tabs.tsx` |
| Bouton WhatsApp flottant (mobile) | `components/layout/whatsapp-float.tsx` |
| Hero : recherche + préselection rapide + conseiller IA | `components/home/*` |
| Conseiller IA (100 % déterministe, table de pondération) | `lib/advisor.ts` |
| Catalogue + filtres (marque, catégorie, modèle, prix, puissance, ville) | `app/vehicules`, `components/vehicle/catalogue.tsx` |
| Carte tilt 3D (souris desktop / gyroscope sur la fiche, permission iOS 13+) | `components/ui/vehicle-tilt-card.tsx` |
| Fiche véhicule : galerie, caractéristiques, conditions, calendrier, CG obligatoires | `components/vehicle/vehicle-detail.tsx` |
| Devis : véhicule → ville → dates → options → récapitulatif imprimable/PDF + WhatsApp | `app/devis`, `components/quote/quote-builder.tsx` |

## URLs SEO

- Véhicule : `/location-porsche-taycan-belgique`
- Ville : `/location-voiture-bruxelles`, `/location-voiture-paris`…
- Catégorie : `/location-supercar-belgique`, `/location-utilitaire-belgique`…
- `sitemap.xml`, `robots.txt`, données structurées (AutoRental, Product/Car + Offer, BreadcrumbList), balises alt, maillage interne.

## Données à personnaliser

- **Véhicules** : `lib/vehicles.ts` (prix, années, puissances, villes de rattachement). Les années et certaines puissances sont des estimations à vérifier.
- **Options du devis** : `lib/options.ts` (tarifs indicatifs).
- **Coordonnées** : variables `NEXT_PUBLIC_*` dans `.env.local`.
- **Conditions générales** : `app/conditions-generales/page.tsx` (texte type à valider).

## Photos

Les 79 photos fournies ont été associées manuellement aux véhicules et renommées (`public/vehicules/<id>/<id>-NN.jpg`, redimensionnées à 1600 px) :

- VW T-Roc : 5 · Renault 4 E-Tech : 6 · Alfa Romeo MiTo : 7 · Ford Fiesta : 7
- BMW X2 : 8 · Toyota Yaris : 6 · Renault Twingo : 5 · Fiat Punto : 7
- Citroën C5 SW : 7 · Citroën Nemo : 7 · Porsche Taycan : 1
- Renault Kangoo II galerie de toit : 8 · Renault Kangoo II échelle + plancher : 7

Aucune photo fournie pour : Opel Adam, Ford Focus, Opel Corsa E, Dacia Sandero, Peugeot 2008, Citroën C4 Picasso, Renault Clio, Fiat 500, Opel Astra Plus, Renault Captur, Fiat 500L, Citroën C3, Dacia Dokker → placeholder graphique. Ajouter des photos : déposer les fichiers dans `public/vehicules/<id>/` et renseigner `views` dans `lib/vehicles.ts`.

**Visuels des cartes catalogue (retouchés IA)** : déposer `public/images/cartes/<id>.webp` puis ajouter `cardImage: "/images/cartes/<id>.webp"` au véhicule. En attendant, la carte affiche un placeholder stylé (photo réelle étalonnée si disponible, sinon silhouette + monogramme).

## Google Calendar

1. Créer le compte Google dédié PRESTIGE CONCIERGERIE et un projet Google Cloud avec l'API Calendar activée.
2. Créer des identifiants OAuth2 (application Web), obtenir un **refresh token** du compte dédié (scope `https://www.googleapis.com/auth/calendar`), p. ex. via OAuth Playground.
3. Renseigner `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID`.
4. Isolation par véhicule, au choix :
   - un calendrier par véhicule : `GOOGLE_CALENDAR_MAP={"porsche-taycan":"xxx@group.calendar.google.com", …}` ;
   - ou un calendrier commun : chaque événement porte le tag privé `vehicle=<id>` (posé automatiquement par le site). Pour un événement créé à la main, préfixer son titre par `[<id>]`, ex. `[bmw-x2] Location M. Dupont`.
5. **Webhook (push notifications)** : définir `GOOGLE_WEBHOOK_TOKEN` et `ADMIN_SECRET`, déployer, puis appeler
   `curl -H "Authorization: Bearer $ADMIN_SECRET" https://<domaine>/api/calendar-watch`.
   Les canaux expirent (~7 jours) : planifier cet appel (cron hebdomadaire, ex. Vercel Cron).

Fonctionnement :
- Demande envoyée depuis le devis → `POST /api/reservations` crée un événement « à confirmer » (refusé si conflit).
- Événement modifié/supprimé dans Google Calendar → `POST /api/calendar-webhook` invalide le cache : la disponibilité est mise à jour immédiatement.
- Fallback : cache de 4 minutes côté serveur + rafraîchissement du calendrier toutes les 4 minutes côté client.
- Sans configuration, le site fonctionne : toutes les dates sont affichées disponibles (« confirmées sur demande ») et les demandes passent par WhatsApp.

Le dossier ne contient aucune mention d'outil de génération externe : la seule marque est **PRESTIGE CONCIERGERIE**.
