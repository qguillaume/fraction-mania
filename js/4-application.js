/* =======================================================================
   4-APPLICATION.JS  —  Le chef d'orchestre.

   Ce fichier est chargé EN DERNIER. Son travail :
     1. se souvenir de l'exercice en cours et de l'étape affichée
     2. mettre l'écran à jour
     3. écouter les clics, le clavier et les boutons

   Il utilise les fonctions des trois fichiers précédents.
   ======================================================================= */

"use strict";


/* ====================== CE DONT ON SE SOUVIENT ======================== */

/* Un seul objet contient tout ce que l'application doit retenir.
   On appelle ça "l'état". Quand l'état change, on redessine l'écran. */
const etat = {
  mode: "melange",   // "simplifier", "somme", "multiplication" ou "melange"
  niveau: "facile",  // "facile", "moyen" ou "costaud"
  etapes: [],        // la liste des étapes de l'exercice en cours
  numeroEtape: 0     // quelle étape on affiche (0 = la première)
};


/* ================= LES MORCEAUX DE PAGE QU'ON MODIFIE ================= */

/* document.getElementById va chercher un élément grâce à son id, écrit
   dans index.html. On les range dans des variables une fois pour toutes,
   pour ne pas avoir à les rechercher à chaque clic. */
const zoneCarte = document.getElementById("scene");
const zoneCalcul = document.getElementById("expr");
const zoneExplication = document.getElementById("note");
const zonePoints = document.getElementById("points");
const zoneCompteur = document.getElementById("compteur");
const zoneIndice = document.getElementById("indice");


/* ======================= FABRIQUER UN EXERCICE ======================== */

function nouvelExercice() {
  // En mode "mélange", on tire au sort le type d'exercice.
  const type =
    etat.mode === "melange"
      ? choix(["simplifier", "somme", "multiplication"])
      : etat.mode;

  if (type === "simplifier") {
    etat.etapes = genererSimplification(etat.niveau);
  } else if (type === "somme") {
    etat.etapes = genererSommeDifference(etat.niveau);
  } else {
    etat.etapes = genererMultiplication(etat.niveau);
  }

  etat.numeroEtape = 0; // on repart de la première étape
  afficher();
}


/* ==================== METTRE L'ÉCRAN À JOUR =========================== */

function afficher() {
  const etape = etat.etapes[etat.numeroEtape];
  const estLaDerniere = etat.numeroEtape === etat.etapes.length - 1;

  // 1) Le calcul et son explication.
  //    innerHTML = "remplace tout le contenu de cet élément par ceci".
  zoneCalcul.innerHTML = dessinerCalcul(etape.calcul);
  zoneExplication.innerHTML = etape.explication;

  // 2) La bordure verte et double quand le calcul est terminé.
  //    classList.toggle ajoute la classe si le 2e argument est vrai,
  //    et l'enlève sinon.
  zoneCarte.classList.toggle("termine", etape.termine === true || estLaDerniere);

  // 3) Les petits ronds de progression, un par étape.
  let htmlDesPoints = "";

  for (let i = 0; i < etat.etapes.length; i++) {
    let classe = "point"; // rond vide : étape pas encore atteinte

    if (i === etat.numeroEtape) {
      classe = "point active"; // rond entouré d'un halo : étape en cours
    } else if (i < etat.numeroEtape) {
      classe = "point faite";  // rond plein : étape déjà vue
    }

    htmlDesPoints += '<span class="' + classe + '"></span>';
  }

  zonePoints.innerHTML = htmlDesPoints;

  // 4) Le compteur et le petit texte "clique ici".
  zoneCompteur.textContent =
    "Étape " + (etat.numeroEtape + 1) + " / " + etat.etapes.length;

  zoneIndice.textContent = estLaDerniere
    ? "✔ Terminé — clique pour une nouvelle ▸"
    : "Clique ici ▸";
}


/* ================= AVANCER ET RECULER DANS LE CALCUL ================== */

function etapeSuivante() {
  if (etat.numeroEtape < etat.etapes.length - 1) {
    etat.numeroEtape = etat.numeroEtape + 1;
    afficher();
  } else {
    // On était déjà à la fin : on enchaîne sur un nouvel exercice.
    nouvelExercice();
  }
}

function etapePrecedente() {
  if (etat.numeroEtape > 0) {
    etat.numeroEtape = etat.numeroEtape - 1;
    afficher();
  }
}


/* ======================== ÉCOUTER L'UTILISATEUR ======================= */

/* addEventListener veut dire : "quand ceci arrive, exécute cette fonction". */

// Un clic n'importe où sur la grande carte.
zoneCarte.addEventListener("click", etapeSuivante);

// Le clavier, quand la carte est sélectionnée (touche Tab).
zoneCarte.addEventListener("keydown", function (evenement) {
  if (evenement.key === " " || evenement.key === "Enter") {
    evenement.preventDefault(); // empêche la page de défiler
    etapeSuivante();
  }
});

// Les raccourcis clavier utilisables partout dans la page.
document.addEventListener("keydown", function (evenement) {
  // Si on est en train d'utiliser un bouton, on ne fait rien :
  // c'est le bouton qui doit répondre.
  if (evenement.target.tagName === "BUTTON") {
    return;
  }

  if (evenement.key === "ArrowLeft") {
    etapePrecedente();
  }
  if (evenement.key === "ArrowRight") {
    etapeSuivante();
  }
  if (evenement.key === "n" || evenement.key === "N") {
    nouvelExercice();
  }
});

// Le bouton bleu "Nouvelle fraction".
document.getElementById("nouvelle").addEventListener("click", nouvelExercice);

/* Les boutons de réglage (type d'exercice et niveau).
   Ils portent un attribut data-mode ou data-niveau dans index.html :
   on récupère sa valeur pour savoir sur quoi l'utilisateur a cliqué.
   aria-pressed="true" marque le bouton choisi, à la fois pour le CSS
   et pour les lecteurs d'écran. */
function brancherLesBoutons(attribut, quandOnClique) {
  const boutons = document.querySelectorAll("[" + attribut + "]");

  for (const bouton of boutons) {
    bouton.addEventListener("click", function () {
      quandOnClique(bouton.getAttribute(attribut));

      // Un seul bouton du groupe peut être choisi à la fois.
      for (const autre of boutons) {
        autre.setAttribute("aria-pressed", autre === bouton ? "true" : "false");
      }

      nouvelExercice();
    });
  }
}

brancherLesBoutons("data-mode", function (valeur) {
  etat.mode = valeur;
});

brancherLesBoutons("data-niveau", function (valeur) {
  etat.niveau = valeur;
});


/* ============================== DÉPART =============================== */

/* Tout est prêt : on affiche le premier exercice. */
nouvelExercice();
