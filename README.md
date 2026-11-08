# Victor Immobilier — Site vitrine

Site d'une seule page en HTML, CSS et JavaScript simples. Aucune installation, aucun serveur : double-cliquez sur `index.html` pour l'ouvrir.

## Contenu du dossier

```
victor-immobilier/
├── index.html          ← toutes les pages et tous les textes
├── css/style.css       ← couleurs, polices, mise en page
├── js/script.js        ← menu mobile, filtre des biens, formulaire
└── assets/images/      ← photos et visuels
```

## Photos et contenus

Les 7 photos fournies sont dans `assets/images/` : 1 pour l'accueil (`accueil-villa-piscine.jpg`) et 6 dans la galerie « Nos biens ».

Rien n'a été inventé sur l'agence. Il reste à compléter :

| Élément | Où le changer |
|---|---|
| Logo officiel | fichier `assets/images/logo-victor-immobilier.jpg`, utilisé dans l'en-tête et le pied de page (2 balises `<img>` dans `index.html`) |
| Localisation, prix, statut (à vendre / à louer) des biens | section `NOS BIENS` : pour l'instant « nous contacter » |
| Téléphone, WhatsApp, e-mail | section `CONTACT` (voir plus bas) |
| Textes des services et phrase d'accroche | propositions à faire valider par l'agence |

## Modifier les couleurs

Dans `css/style.css`, tout en haut, le bloc `:root` contient toutes les couleurs (`--vert-900`, `--vert-700`, `--fond`…). Changez une valeur : tout le site suit.

## Ajouter ou modifier un bien

Dans la section `NOS BIENS`, copiez un bloc `<article class="property"> … </article>` et collez-le à la suite. Modifiez :
- `data-type` : `maison` (villa ou maison) ou `terrain`, pour le filtre ;
- la photo : mettez votre fichier dans `assets/images/` (idéalement 1200 px de large, en .jpg) et changez `src` et `alt` ;
- le titre, la localisation (`Localisation : nous contacter`), le prix ou le loyer (`Prix et détails : nous contacter`) ;
- l'étiquette (`Villa`, `Maison`, `Terrain`, ou `À vendre` / `À louer`).

N'ajoutez que de **vrais** biens, avec l'accord de l'agence pour les photos.

## Renseigner les coordonnées

Dans la section `CONTACT` :
- Téléphone : remplacez `+242000000000` dans `tel:` et le texte affiché ;
- WhatsApp (contact général **et** boutons des annonces) : ouvrez `index.html`, cherchez `data-whatsapp` dans la balise `<body>` et remplacez `242000000000` par le numéro complet, sans `+` ni espaces (ex. `242061234567`). C'est le seul endroit à modifier ;
- E-mail : remplacez `contact@exemple.com`.

Supprimez ensuite l'attribut `data-placeholder="…"` de chaque lien modifié, sinon le site affichera encore « à renseigner » au clic.

## Carte Google Maps (section Contact)

La carte ne s'affiche que lorsque la position **exacte** de l'agence est renseignée (aucune carte générale, aucun point approximatif). Tant que ce n'est pas fait, le bloc « Nous trouver » est masqué ; l'adresse reste écrite dans la liste de contacts.

**Option A, coordonnées GPS** : sur Google Maps, clic droit (ordinateur) ou appui long (téléphone) exactement sur l'entrée de l'agence ; copiez les deux nombres affichés (latitude puis longitude). Dans `index.html`, cherchez `id="carte-agence"` et remplissez `data-lat="…" data-lng="…"`. La carte s'ouvre centrée et zoomée (`data-zoom`, de 1 à 21) avec un marqueur « Victor Immobilier », déplaçable et zoomable ; « Itinéraire » mène à ce point.

**Option B, fiche Google Maps de l'agence** : sur sa fiche, « Partager » → « Intégrer une carte » → copiez l'adresse qui suit `src="` (elle commence par `https://www.google.com/maps/embed`) dans `data-embed`, et le lien « Partager » de la fiche dans `data-itineraire`.

## Image d'accueil (hero)

La photo est le fond de la section d'accueil (`.hero-photo` dans `css/style.css`). Pour changer le cadrage, modifiez `object-position` ; pour la force du dégradé côté texte, modifiez le `linear-gradient` de `.hero-photo::after`.

## Contact lié à chaque annonce

Chaque bien a trois boutons : **Demander des informations**, **Organiser une visite** et **Contacter sur WhatsApp**.
- Les deux premiers ouvrent une fenêtre avec le nom du bien déjà affiché et un message prêt à l'emploi. Le visiteur n'a rien à recopier : il indique son nom, son e-mail, éventuellement son téléphone, et pour une visite une date et une heure.
- Chaque demande part vers Formspree avec le **nom du bien, sa catégorie, un lien vers la fiche**, le type de demande (informations ou visite) et un objet de mail clair, par exemple « Demande de visite : Villa avec piscine ».
- WhatsApp ouvre une conversation avec le message « Bonjour, je suis intéressé(e) par votre annonce concernant … ».
- Le nouveau bien que vous ajoutez (voir plus haut) reçoit automatiquement ces trois boutons si vous copiez un bloc existant.

**Référence et statut** : ils n'ont pas été fournis, donc ils ne sont pas envoyés. Pour les ajouter à un bien, mettez sur son `<article class="property" …>` : `data-ref="VI-001"` et `data-statut="À vendre"` (ou `À louer`). Ils apparaîtront alors dans la fenêtre et dans le mail reçu.

## Formulaire de contact

Le formulaire est relié à Formspree (`https://formspree.io/f/mnppygbz`, dans `index.html`, balise `<form id="form-contact">`). Chaque message arrive dans la boîte mail du compte Formspree, avec le sujet « Nouveau message depuis le site Victor Immobilier ». Champs transmis : nom, téléphone, e-mail, demande, message.

Pour changer l'adresse de réception, modifiez-la dans votre compte Formspree (pas dans le code).

## Publier gratuitement

Mettez le dossier sur GitHub, puis reliez le dépôt à Netlify (ou Cloudflare Pages) : chaque modification poussée sur GitHub met le site à jour automatiquement.
