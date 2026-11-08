/* =====================================================================
   VICTOR IMMOBILIER : comportements du site (JavaScript natif)
   ===================================================================== */
(function () {
  "use strict";

  var toast = document.getElementById("toast");
  var toastTimer;

  function afficherMessage(texte) {
    if (!toast) return;
    toast.textContent = texte;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4200);
  }

  /* ---------- Année du pied de page ---------- */
  var annee = document.getElementById("annee");
  if (annee) annee.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  var bouton = document.querySelector(".menu-toggle");
  var menu = document.getElementById("menu");
  if (bouton && menu) {
    function fermerMenu() {
      menu.classList.remove("open");
      bouton.setAttribute("aria-expanded", "false");
      bouton.setAttribute("aria-label", "Ouvrir le menu");
    }
    bouton.addEventListener("click", function () {
      var ouvert = menu.classList.toggle("open");
      bouton.setAttribute("aria-expanded", ouvert ? "true" : "false");
      bouton.setAttribute("aria-label", ouvert ? "Fermer le menu" : "Ouvrir le menu");
    });
    menu.querySelectorAll("a").forEach(function (lien) { lien.addEventListener("click", fermerMenu); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") fermerMenu(); });
  }

  /* ---------- Lien actif pendant le défilement ---------- */
  var liens = Array.prototype.slice.call(document.querySelectorAll(".main-nav ul a"));
  var sections = liens.map(function (l) { return document.querySelector(l.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var suivi = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          liens.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entree.target.id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) suivi.observe(s); });
  }

  /* ---------- Apparition douce des blocs ---------- */
  var blocs = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var apparition = new IntersectionObserver(function (entrees, obs) {
      entrees.forEach(function (entree) {
        if (entree.isIntersecting) {
          entree.target.classList.add("visible");
          obs.unobserve(entree.target);
        }
      });
    }, { threshold: 0.12 });
    blocs.forEach(function (b) { apparition.observe(b); });
  } else {
    blocs.forEach(function (b) { b.classList.add("visible"); });
  }

  /* ---------- Filtre des biens (Tous / À vendre / À louer) ---------- */
  var filtres = document.querySelectorAll(".filter");
  var biens = document.querySelectorAll(".property");
  filtres.forEach(function (f) {
    f.addEventListener("click", function () {
      var type = f.getAttribute("data-filter");
      filtres.forEach(function (x) { x.classList.toggle("is-active", x === f); });
      biens.forEach(function (b) {
        b.hidden = !(type === "tous" || b.getAttribute("data-type") === type);
        if (!b.hidden) b.classList.add("visible");
      });
    });
  });

  /* ---------- WhatsApp : numéro unique, lu dans <body data-whatsapp="…"> ---------- */
  function numeroWhatsApp() {
    var n = (document.body.getAttribute("data-whatsapp") || "").replace(/\D/g, "");
    var local = n.replace(/^242/, "");
    /* Numéro encore factice (que des zéros) ou trop court : considéré comme non renseigné */
    return (local.length >= 7 && !/^0+$/.test(local)) ? n : "";
  }

  var lienWaContact = document.getElementById("lien-whatsapp-contact");
  if (lienWaContact && numeroWhatsApp()) {
    lienWaContact.href = "https://wa.me/" + numeroWhatsApp();
    lienWaContact.removeAttribute("data-placeholder");
    var mention = lienWaContact.querySelector("small");
    if (mention) mention.remove();
  }

  /* ---------- Coordonnées pas encore renseignées ---------- */
  document.querySelectorAll("[data-placeholder]").forEach(function (lien) {
    lien.addEventListener("click", function (e) {
      if (!lien.hasAttribute("data-placeholder")) return;
      e.preventDefault();
      afficherMessage("Ajoutez d'abord " + lien.getAttribute("data-placeholder") + " de l'agence (voir le README).");
    });
  });

  /* ---------- Formulaires : validation + envoi via Formspree (utilisé par le formulaire général ET celui des annonces) ---------- */
  function messageErreur(reponse, donnees) {
    if (reponse.status === 429) return "Trop de tentatives en peu de temps. Merci de patienter une minute puis de réessayer.";
    if (reponse.status === 422 || reponse.status === 400) {
      var details = donnees && donnees.errors && donnees.errors.map(function (x) { return x.message; }).join(" ");
      return "Le message n'a pas pu être envoyé : " + (details || "merci de vérifier les informations saisies.");
    }
    return "Le message n'a pas pu être envoyé pour le moment. Merci de réessayer dans quelques instants ou de contacter l'agence par WhatsApp.";
  }

  function brancherFormulaire(form, options) {
    options = options || {};
    var statut = form.querySelector(".form-status");
    var succes = form.querySelector(".form-success");
    var autre = form.querySelector(".form-again");
    var bouton = form.querySelector("button[type=submit]");
    var libelle = bouton.textContent;
    var envoiEnCours = false;

    function message(texte, type) {
      statut.textContent = texte;
      statut.className = "form-status " + (type || "");
    }

    /* Remet le formulaire à zéro (affichage du formulaire, plus de confirmation ni d'erreur) */
    form.reinitialiserAffichage = function () {
      succes.hidden = true;
      form.classList.remove("is-sent");
      message("", "");
      form.querySelectorAll(".invalid").forEach(function (c) { c.classList.remove("invalid"); });
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (envoiEnCours) return; /* empêche les envois multiples */
      message("", "");

      var erreurs = 0, premier = null;
      form.querySelectorAll("[required]").forEach(function (champ) {
        var vide = !champ.value.trim();
        var mauvaisEmail = champ.type === "email" && champ.value && !/^\S+@\S+\.\S+$/.test(champ.value.trim());
        champ.classList.toggle("invalid", vide || mauvaisEmail);
        champ.setAttribute("aria-invalid", (vide || mauvaisEmail) ? "true" : "false");
        if (vide || mauvaisEmail) { erreurs++; if (!premier) premier = champ; }
      });
      if (erreurs) {
        message("Merci de remplir correctement les champs obligatoires (*).", "err");
        premier.focus();
        return;
      }

      envoiEnCours = true;
      bouton.disabled = true;
      bouton.textContent = "Envoi en cours…";

      var donneesForm = new FormData(form);
      if (options.avantEnvoi) options.avantEnvoi(donneesForm);

      fetch(form.action, { method: "POST", body: donneesForm, headers: { "Accept": "application/json" } })
        .then(function (reponse) {
          return reponse.json().catch(function () { return null; }).then(function (donnees) {
            if (reponse.ok) {
              form.reset();
              message("", "");
              form.classList.add("is-sent");
              succes.hidden = false;
              succes.focus();
              if (options.apresSucces) options.apresSucces();
            } else {
              message(messageErreur(reponse, donnees), "err");
            }
          });
        })
        .catch(function () {
          message("Connexion impossible : le message n'a pas été envoyé. Vérifiez votre connexion Internet puis réessayez.", "err");
        })
        .then(function () {
          envoiEnCours = false;
          bouton.disabled = false;
          bouton.textContent = libelle;
        });
    });

    form.querySelectorAll("input, textarea").forEach(function (champ) {
      champ.addEventListener("input", function () {
        champ.classList.remove("invalid");
        champ.removeAttribute("aria-invalid");
      });
    });

    if (autre) {
      autre.addEventListener("click", function () {
        form.reinitialiserAffichage();
        var premierChamp = form.querySelector("input:not([type=hidden]):not(.hp)");
        if (premierChamp) premierChamp.focus();
      });
    }
  }

  /* Formulaire général de contact (inchangé dans son fonctionnement) */
  var formGeneral = document.getElementById("form-contact");
  if (formGeneral) brancherFormulaire(formGeneral);

  /* ---------- Contact lié à chaque annonce ---------- */
  var fenetre = document.getElementById("modal-bien");
  var formBien = document.getElementById("form-bien");
  var courant = null; /* annonce actuellement ouverte dans la fenêtre */

  function lienAnnonce(id) {
    /* Lien direct vers la fiche, utile à l'agence (uniquement quand le site est en ligne) */
    if (!/^https?:$/.test(location.protocol)) return "";
    return location.origin + location.pathname + "#" + id;
  }

  /* Lit les informations de l'annonce directement dans la fiche : rien n'est inventé ni recopié à la main */
  function infosBien(carte) {
    var badge = carte.querySelector(".badge");
    return {
      id: carte.id,
      nom: carte.querySelector("h3").textContent.trim(),
      categorie: badge ? badge.textContent.trim() : "",
      reference: (carte.getAttribute("data-ref") || "").trim(),
      statut: (carte.getAttribute("data-statut") || "").trim(),
      lien: lienAnnonce(carte.id)
    };
  }

  function urlWhatsApp(numero, bien) {
    var texte = "Bonjour, je suis intéressé(e) par votre annonce concernant « " + bien.nom + " ». " +
      "J'aimerais obtenir davantage d'informations et éventuellement organiser une visite.";
    if (bien.reference) texte += "\nRéférence : " + bien.reference;
    if (bien.lien) texte += "\nAnnonce : " + bien.lien;
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texte);
  }

  function dateDuJour() {
    var d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function ouvrirDemande(bien, mode) {
    var visite = mode === "visite";
    courant = { bien: bien, visite: visite };
    formBien.reinitialiserAffichage();

    var typeDemande = visite ? "Demande de visite" : "Demande d'informations";
    document.getElementById("modal-titre").textContent = visite ? "Organiser une visite" : "Demander des informations";
    document.getElementById("recap-nom").textContent = bien.nom;
    document.getElementById("recap-meta").textContent = [bien.categorie, bien.statut, bien.reference ? "Réf. " + bien.reference : ""]
      .filter(Boolean).join(" · ");

    /* Champs transmis à Formspree (vides = non envoyés) */
    var champs = {
      "b-type": typeDemande, "b-nom": bien.nom, "b-categorie": bien.categorie,
      "b-reference": bien.reference, "b-statut": bien.statut, "b-lien": bien.lien,
      "b-sujet": typeDemande + " : " + bien.nom + (bien.reference ? " (" + bien.reference + ")" : "")
    };
    Object.keys(champs).forEach(function (id) {
      var el = document.getElementById(id);
      el.value = champs[id];
      el.disabled = !champs[id];
    });

    /* Date et heure : seulement pour une visite */
    var blocVisite = document.getElementById("visit-fields");
    blocVisite.hidden = !visite;
    blocVisite.querySelectorAll("input").forEach(function (i) { i.disabled = !visite; i.value = ""; });
    document.getElementById("b-date").min = dateDuJour();

    /* Message prêt à l'emploi, modifiable */
    document.getElementById("b-message").value = visite
      ? "Bonjour, je souhaite organiser une visite de « " + bien.nom + " ». Merci de me confirmer les possibilités."
      : "Bonjour, je suis intéressé(e) par « " + bien.nom + " ». J'aimerais obtenir davantage d'informations.";

    document.getElementById("b-succes").textContent = "Votre demande concernant « " + bien.nom + " » a bien été transmise. L'agence vous répondra dès que possible.";

    document.body.classList.add("modal-open");
    if (typeof fenetre.showModal === "function") fenetre.showModal(); else fenetre.setAttribute("open", "");
    document.getElementById("b-visiteur").focus();
  }

  if (fenetre && formBien) {
    brancherFormulaire(formBien, {
      avantEnvoi: function (donnees) {
        /* Date lisible pour l'agence : « samedi 14 novembre 2026 » */
        var d = donnees.get("date_visite_souhaitee");
        if (d) {
          var jour = new Date(d + "T12:00:00");
          donnees.set("date_visite_souhaitee", jour.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
        }
      }
    });

    fenetre.addEventListener("close", function () { document.body.classList.remove("modal-open"); });
    fenetre.addEventListener("click", function (e) {
      /* Clic sur le fond sombre ou sur un bouton « Fermer » */
      if (e.target === fenetre || (e.target.closest && e.target.closest("[data-close]"))) fenetre.close();
    });
  }

  document.querySelectorAll(".property").forEach(function (carte) {
    carte.querySelectorAll("[data-action]").forEach(function (bouton) {
      var action = bouton.getAttribute("data-action");

      if (action === "whatsapp") {
        /* Lien préparé dès le chargement, et recalculé au clic */
        if (numeroWhatsApp()) bouton.href = urlWhatsApp(numeroWhatsApp(), infosBien(carte));
        bouton.addEventListener("click", function (e) {
          var numero = numeroWhatsApp();
          if (!numero) {
            e.preventDefault();
            afficherMessage("Le numéro WhatsApp de l'agence n'est pas encore renseigné (voir le README).");
            return;
          }
          bouton.href = urlWhatsApp(numero, infosBien(carte));
        });
      } else {
        bouton.addEventListener("click", function () { ouvrirDemande(infosBien(carte), action); });
      }
    });
  });

  /* Carte Google Maps : affichée seulement avec une position EXACTE, jamais approximative.
     - data-lat + data-lng : carte centrée/zoomée sur ce point, marqueur « Victor Immobilier », itinéraire vers ce point ;
     - ou data-embed : lien d'intégration copié depuis Google Maps (Partager > Intégrer une carte) + data-itineraire. */
  (function () {
    var bloc = document.getElementById("carte-agence");
    if (!bloc) return;
    var iframe = document.getElementById("map-iframe");
    var lien = document.getElementById("map-link");
    var lat = parseFloat(bloc.getAttribute("data-lat"));
    var lng = parseFloat(bloc.getAttribute("data-lng"));
    var embed = (bloc.getAttribute("data-embed") || "").trim();
    var itineraire = (bloc.getAttribute("data-itineraire") || "").trim();
    var coordOk = isFinite(lat) && isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    var nom = bloc.getAttribute("data-nom") || "Victor Immobilier";
    var zoom = parseInt(bloc.getAttribute("data-zoom"), 10) || 18;
    var pos = coordOk ? lat + "," + lng : "";

    if (embed.indexOf("https://www.google.com/maps/embed") === 0) {
      iframe.src = embed;
    } else if (coordOk) {
      iframe.src = "https://www.google.com/maps?q=" + encodeURIComponent(pos + "(" + nom + ")") + "&z=" + zoom + "&output=embed";
    } else {
      return; /* pas de position exacte : le bloc reste masqué */
    }
    if (coordOk) lien.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(pos);
    else if (itineraire.indexOf("https://") === 0) lien.href = itineraire;
    else lien.hidden = true;
    bloc.hidden = false;
  })();

  /* Lien direct vers une annonce (#bien-...) : on la met en évidence un instant */
  if (location.hash && /^#bien-/.test(location.hash)) {
    var cible = document.getElementById(location.hash.slice(1));
    if (cible) { cible.classList.add("visible"); }
  }
})();
