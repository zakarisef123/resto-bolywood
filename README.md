# Site du Restaurant Indien Bollywood — Gaillard

Site statique bilingue (français / anglais), HTML/CSS/JS sans dépendance, hébergé sur Netlify.

## Pages
| Français | English | Contenu |
|---|---|---|
| `/` | `/en/` | Accueil : statut ouvert/fermé en direct, plats signature, réservation / commande, horaires, plan |
| `/menu/` | `/en/menu/` | Carte complète (≈150 plats) : recherche, filtres végétarien / épicé, photos, prix à emporter |
| `/commandes-en-ligne/` | `/en/order/` | Commande à emporter : panier, −10 %, riz Kashmiri offert dès 20 €, heure de retrait |
| `/reservations/` | `/en/book/` | Réservation (créneaux selon les horaires), téléphone, TheFork |
| `/photos/` | `/en/photos/` | Galerie avec visionneuse |
| `/a-propos-de-nous/` | `/en/about/` | Notre histoire |
| `/loyalty/` | `/en/loyalty/` | Programme de fidélité (Basique / Argent / Or) |
| `/avis/` | `/en/reviews/` | Liens Google, TripAdvisor, TheFork (`/comaintaires/` redirige ici) |
| `/contacter-nous/` | `/en/contact/` | Formulaire de contact, coordonnées, plan |
| `/qr/` | — | **Outil du restaurant** : chevalets de table avec QR code vers la carte, à imprimer (non référencé) |

Les adresses d'origine du site Wix sont conservées pour ne pas perdre le référencement.

## Formulaires (Netlify Forms)
Réservations, commandes à emporter et messages sont envoyés à **Netlify Forms** :
trois formulaires `reservation`, `commande-emporter` et `contact`.

À faire une fois dans Netlify :
1. **Forms** → **Enable form detection**, puis redéployer le site (Deploys → Trigger deploy).
2. **Site configuration → Forms → Form notifications** → *Add notification* → *Email notification*
   → saisir `bollywood.gaillard@gmail.com` (répéter pour les 3 formulaires, ou choisir « Any form »).

Si l'envoi échoue, le site ouvre la messagerie du client avec la demande pré-remplie : aucune demande n'est perdue.
Offre gratuite Netlify : 100 envois par mois.

## Réglages — `assets/js/data.js`
- **`hours`** : horaires (0 = dimanche … 6 = samedi) — statut « Ouvert / Fermé », créneaux de réservation et de retrait.
- **`prepMinutes`**, **`giftThreshold`** : délai de préparation (25 min) et seuil du riz offert (20 €).
- **`forms`** : `"netlify"` (par défaut) ou autre valeur pour revenir à l'envoi par e-mail.

## Modifier la carte
Les plats sont dans `window.BW_MENU` (même fichier). Chaque plat : `name`, `desc`, `price`,
`name_en` / `desc_en` (version anglaise), `tags` (`"veg"`, ou 1/2/3 pour le niveau de piquant), `img`.

Les textes des pages sont générés par le script `build-site.js` (non inclus ici) : pour une modification
de texte ponctuelle, éditer directement le fichier `index.html` concerné, dans les deux langues.

## Animations
Titre révélé mot par mot, braises d'épices sur l'accueil, bandeau défilant, cartes 3D, parallaxe,
plat qui « vole » vers le panier, transitions entre pages. Tout est désactivé automatiquement si le
visiteur a demandé à réduire les animations dans les réglages de son appareil.

## Tester en local
Ouvrir un serveur dans ce dossier, par exemple : `npx serve .` puis http://localhost:3000
