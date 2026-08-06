/* =======================================================================
   2-AFFICHAGE.JS  —  Comment on dessine une fraction à l'écran.

   Le problème : une fraction s'écrit sur deux lignes (le numérateur, un
   trait, le dénominateur). On ne peut donc pas juste écrire "8/6".

   La solution : on décrit le calcul avec des petites boîtes, et ce
   fichier transforme ces boîtes en HTML que le navigateur sait afficher.

   Il y a 4 sortes de boîtes :

     morceau("× 2", true)   un bout de texte, à mettre en évidence ou non
     fraction([...], [...]) une fraction : la liste du haut, celle du bas
     entier(3)              un nombre tout seul, sans barre de fraction
     operation("+")         le signe entre deux fractions : + − ×

   Exemple, pour afficher   4 × 2
                            -----
                            3 × 2

     fraction(
       [ morceau(4), morceau(" × 2", true) ],   <- le haut
       [ morceau(3), morceau(" × 2", true) ]    <- le bas
     )

   Le "true" veut dire : ce morceau est important, on le met en couleur,
   en gras, souligné, sur fond pâle (voir la règle .hl dans le CSS).
   ======================================================================= */

"use strict";


/* ========================= FABRIQUER LES BOÎTES ======================== */

/* Un bout de texte. enEvidence = true pour le faire ressortir. */
function morceau(texte, enEvidence) {
  return {
    texte: String(texte),          // String() transforme le nombre en texte
    enEvidence: enEvidence === true // sans 2e argument, c'est false
  };
}

/* Une fraction. haut et bas sont des LISTES de morceaux. */
function fraction(haut, bas) {
  return { type: "fraction", haut: haut, bas: bas };
}

/* Un nombre entier, affiché sans barre de fraction. */
function entier(valeur) {
  return { type: "entier", valeur: valeur };
}

/* Un signe d'opération : "+", "−" ou "×". */
function operation(symbole) {
  return { type: "operation", symbole: symbole };
}

/* Bien pratique : si le dénominateur vaut 1, on affiche un entier.
   Parce que 3/1, ça s'écrit simplement 3. */
function fractionOuEntier(haut, bas) {
  if (bas === 1) {
    return entier(haut);
  }
  return fraction([morceau(haut)], [morceau(bas)]);
}


/* ====================== TRANSFORMER EN HTML =========================== */

/* Sécurité : on remplace les caractères < > & qui ont un sens spécial en
   HTML, pour qu'ils s'affichent comme du texte normal. */
function echapper(texte) {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* Une liste de morceaux -> du HTML.
   Les morceaux en évidence sont enveloppés dans <span class="hl">. */
function dessinerMorceaux(morceaux) {
  let html = "";

  for (const bout of morceaux) {
    if (bout.enEvidence) {
      html += '<span class="hl">' + echapper(bout.texte) + "</span>";
    } else {
      html += echapper(bout.texte);
    }
  }

  return html;
}

/* Une seule boîte -> du HTML. */
function dessinerBoite(boite) {
  if (boite.type === "operation") {
    return '<span class="op">' + echapper(boite.symbole) + "</span>";
  }

  if (boite.type === "entier") {
    return '<span class="entier">' + echapper(String(boite.valeur)) + "</span>";
  }

  // Sinon c'est une fraction : le haut, le trait, puis le bas.
  return (
    '<span class="frac">' +
      '<span class="num">' + dessinerMorceaux(boite.haut) + "</span>" +
      '<span class="bar"></span>' +
      '<span class="den">' + dessinerMorceaux(boite.bas) + "</span>" +
    "</span>"
  );
}

/* Toute une ligne de calcul (plusieurs boîtes) -> du HTML. */
function dessinerCalcul(boites) {
  let html = "";

  for (const boite of boites) {
    html += dessinerBoite(boite);
  }

  return html;
}
