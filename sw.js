/* =======================================================================
   SW.JS  —  Le "service worker" : c'est lui qui fait marcher l'appli
             SANS INTERNET, une fois installée sur le téléphone.

   Comment ça marche, en une image :
   c'est un petit gardien qui se place entre l'application et internet.
   La première fois, il range une copie de chaque fichier dans une boîte
   (le "cache"). Ensuite, quand l'appli demande un fichier, c'est lui qui
   répond avec la copie — même dans le train, même en avion.

   Il vit à part de la page : il n'a accès ni au HTML ni aux boutons.
   Il ne connaît que trois moments, appelés "événements" :

     install  -> je viens d'être installé : je remplis la boîte
     activate -> je prends mon service : je jette les vieilles boîtes
     fetch    -> l'appli demande un fichier : je le sers

   ATTENTION, LA SEULE CHOSE À RETENIR POUR MODIFIER L'APPLI :
   après avoir changé un fichier, monte le numéro de VERSION juste en
   dessous (v1 -> v2). Sinon les téléphones garderont l'ancienne copie.
   ======================================================================= */

"use strict";

/* Le nom de la boîte. En changeant le numéro, on repart d'une boîte
   neuve, et l'ancienne est jetée automatiquement (voir "activate"). */
const VERSION = "fraction-mania-v7";

/* La liste des fichiers à garder en copie.
   Les chemins commencent par "./" : ils sont donc relatifs à ce fichier.
   C'est important pour que ça marche aussi bien sur GitHub Pages
   (adresse .../fraction-mania/) qu'en local. */
const FICHIERS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/1-couleurs.css",
  "./css/2-mise-en-page.css",
  "./js/1-outils.js",
  "./js/2-affichage.js",
  "./js/3-exercices.js",
  "./js/4-application.js",
  "./js/5-installation.js",
  "./icones/icone-192.png",
  "./icones/icone-512.png",
  "./icones/icone-maskable-512.png",
  "./icones/icone-apple-180.png"
];


/* ======================= 1. INSTALL : on remplit la boîte ============== */

self.addEventListener("install", function (evenement) {
  /* waitUntil = "ne me considère pas installé tant que ce n'est pas fini". */
  evenement.waitUntil(
    caches.open(VERSION).then(function (boite) {
      return boite.addAll(FICHIERS);
    })
  );

  /* Normalement un nouveau service worker attend que tous les onglets
     soient fermés. skipWaiting lui dit de prendre la relève tout de
     suite : la nouvelle version arrive dès le rechargement suivant. */
  self.skipWaiting();
});


/* =================== 2. ACTIVATE : on jette les vieilles boîtes ======== */

self.addEventListener("activate", function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      /* On supprime toutes les boîtes qui ne portent pas la VERSION
         actuelle, pour ne pas encombrer le téléphone. */
      return Promise.all(
        noms.map(function (nom) {
          if (nom !== VERSION) {
            return caches.delete(nom);
          }
        })
      );
    })
  );

  /* On prend en charge les pages déjà ouvertes, sans attendre. */
  self.clients.claim();
});


/* ============ 3. FETCH : l'appli demande un fichier, on répond ========= */

self.addEventListener("fetch", function (evenement) {
  const requete = evenement.request;

  /* On ne s'occupe que des simples demandes de lecture (GET) et
     uniquement des fichiers de notre propre site. */
  if (requete.method !== "GET") {
    return;
  }
  if (new URL(requete.url).origin !== self.location.origin) {
    return;
  }

  evenement.respondWith(
    caches.match(requete).then(function (copie) {
      /* On lance quand même une demande à internet en arrière-plan,
         pour rafraîchir la copie en douce. Si ça échoue (hors ligne),
         tant pis : on avait déjà la copie. */
      const surInternet = fetch(requete)
        .then(function (reponse) {
          if (reponse && reponse.ok) {
            const pourLaBoite = reponse.clone(); // une réponse ne se lit qu'une fois
            caches.open(VERSION).then(function (boite) {
              boite.put(requete, pourLaBoite);
            });
          }
          return reponse;
        })
        .catch(function () {
          /* Pas de réseau : on renvoie la copie. Et si on n'en a même
             pas (fichier jamais visité), on signale une erreur réseau
             normale, comme le ferait le navigateur. */
          return copie || Response.error();
        });

      /* On répond IMMÉDIATEMENT avec la copie si on l'a (c'est instantané),
         sinon on attend internet. */
      return copie || surInternet;
    })
  );
});
