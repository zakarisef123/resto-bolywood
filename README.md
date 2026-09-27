# Site du Restaurant Indien Bollywood — Gaillard

Site statique (HTML/CSS/JS, aucune dépendance), prêt pour GitHub Pages, Netlify, OVH, etc.

## Pages
| URL | Contenu |
|---|---|
| `/` | Accueil : statut ouvert/fermé en direct, plats signature, réservation / commande, horaires, plan |
| `/menu/` | Carte complète (≈150 plats) : recherche, filtres végétarien / épicé, photos, prix à emporter |
| `/commandes-en-ligne/` | Commande à emporter : panier, −10 %, riz Kashmiri offert dès 20 €, choix de l'heure de retrait |
| `/reservations/` | Formulaire de réservation (créneaux selon les horaires), téléphone, TheFork |
| `/photos/` | Galerie avec visionneuse |
| `/a-propos-de-nous/` | Notre histoire |
| `/loyalty/` | Programme de fidélité (Basique / Argent / Or) |
| `/avis/` | Liens Google, TripAdvisor, TheFork (`/comaintaires/` redirige ici) |
| `/contacter-nous/` | Formulaire de contact, coordonnées, plan |

Les adresses d'origine du site Wix sont conservées pour ne pas perdre le référencement.

## Réglages importants — `assets/js/data.js`
- **`formEndpoint`** : vide par défaut. Les réservations, commandes et messages ouvrent alors
  la messagerie du client avec un e-mail pré-rempli vers `bollywood.gaillard@gmail.com`.
  Pour recevoir les demandes directement (sans que le client ait à envoyer l'e-mail), créer
  un formulaire gratuit sur https://formspree.io ou https://web3forms.com et coller son URL ici.
- **`hours`** : horaires (0 = dimanche … 6 = samedi). Utilisés pour le statut « Ouvert / Fermé »,
  les créneaux de réservation et de retrait.
- **`prepMinutes`**, **`giftThreshold`** : délai de préparation (25 min) et seuil du riz offert (20 €).

## Modifier la carte
Les plats sont dans `window.BW_MENU` (même fichier). Chaque plat : `name`, `desc`, `price`,
`tags` (`"veg"`, ou 1/2/3 pour le niveau de piquant), `img`.

## Tester en local
Ouvrir un serveur dans ce dossier, par exemple : `npx serve .` puis http://localhost:3000
