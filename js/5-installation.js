/* =======================================================================
   5-INSTALLATION.JS  —  Transformer le site en vraie application.

   Deux choses ici :

     1. réveiller le service worker (sw.js), celui qui garde une copie
        de l'appli pour qu'elle marche sans internet — et faire en sorte
        qu'une nouvelle version s'applique toute seule ;

     2. afficher un bouton "Installer l'appli" quand le téléphone
        propose de l'ajouter à l'écran d'accueil.

   Tout est protégé par des "if" : si le navigateur ne sait pas faire,
   il ne se passe rien de grave, l'appli fonctionne quand même.
   ======================================================================= */

"use strict";


/* ================= 1. RÉVEILLER LE SERVICE WORKER ===================== */

/* Le service worker a besoin d'une adresse en https:// (ou de
   localhost pour les essais). Si on ouvre le fichier par un
   double-clic (adresse file://), le navigateur le refuse : on ne
   tente même pas, pour ne pas afficher d'erreur inutile. */
const adresseSecurisee =
  location.protocol === "https:" || location.hostname === "localhost";

if ("serviceWorker" in navigator && adresseSecurisee) {
  /* Y avait-il DÉJÀ une copie de l'appli en place en arrivant ?
     On le note tout de suite, avant que le nouveau service worker ne
     s'installe : la réponse sert juste en dessous. */
  const copieDejaEnPlace = navigator.serviceWorker.controller !== null;

  /* On attend que la page soit entièrement chargée : le service worker
     est un bonus, il ne doit pas ralentir l'affichage du premier calcul. */
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").catch(function (erreur) {
      // En cas de problème, on le note dans la console (touche F12).
      console.log("Service worker non enregistré :", erreur);
    });
  });

  /* ============== LA MISE À JOUR QUI S'APPLIQUE TOUTE SEULE ============

     LE PROBLÈME QUE ÇA RÈGLE.
     Quand on publie une nouvelle version, la page a déjà chargé ses
     fichiers AVANT que le nouveau service worker n'arrive. On voyait
     donc encore l'ancienne appli, et il fallait la relancer une
     deuxième fois pour voir les changements. Pire : on pouvait se
     retrouver avec un mélange — le nouveau bouton de la page, mais
     l'ancien code derrière, qui ne sait pas quoi en faire.

     LA SOLUTION.
     "controllerchange" se déclenche au moment précis où le nouveau
     service worker prend le relais. On recharge alors la page une fois :
     tout revient alors de la même version, d'un seul coup.

     DEUX SÉCURITÉS.
     - copieDejaEnPlace : au tout premier passage il n'y a rien à
       remplacer, donc rien à recharger ;
     - dejaRecharge : un verrou, pour ne pas recharger en boucle. */
  let dejaRecharge = false;

  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (dejaRecharge || !copieDejaEnPlace) {
      return;
    }
    dejaRecharge = true;
    window.location.reload();
  });
}


/* ================= 2. LE BOUTON "INSTALLER L'APPLI" =================== */

const boutonInstaller = document.getElementById("installer");

/* Ici on gardera la proposition d'installation envoyée par le navigateur.
   "let" et non "const", parce que son contenu va changer. */
let propositionInstallation = null;

/* Sur Android/Chrome, le navigateur prévient qu'il peut installer
   l'appli. On intercepte ce message pour choisir NOUS-MÊMES le moment
   de le montrer : on affiche notre bouton. */
window.addEventListener("beforeinstallprompt", function (evenement) {
  evenement.preventDefault(); // on garde la main
  propositionInstallation = evenement;
  boutonInstaller.hidden = false; // le bouton apparaît
});

/* Quand on clique sur notre bouton, on ressort la proposition mise de
   côté : c'est le navigateur qui affiche alors sa vraie fenêtre
   d'installation. */
boutonInstaller.addEventListener("click", async function () {
  if (!propositionInstallation) {
    return;
  }

  propositionInstallation.prompt();
  await propositionInstallation.userChoice; // on attend la réponse

  /* Une proposition ne sert qu'une fois : on la jette et on cache
     le bouton. */
  propositionInstallation = null;
  boutonInstaller.hidden = true;
});

/* Si l'installation a réussi, le bouton n'a plus de raison d'être. */
window.addEventListener("appinstalled", function () {
  boutonInstaller.hidden = true;
});
