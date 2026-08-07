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

   Tout en bas du fichier se trouve un dessin d'un autre genre :
   la DEMI-DROITE GRADUÉE, qui montre où se place le résultat final.
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


/* =======================================================================
   LA DEMI-DROITE GRADUÉE

   À la toute fin d'un calcul, on ne se contente pas d'écrire le résultat :
   on montre OÙ ce nombre se trouve. Savoir que 7/4 se place entre 1 et 2,
   c'est aussi important que savoir le calculer.

        3/4
         ▼
   0 ────┼──── 1 ──────── 2 ─────▸

   Le dessin est fait en SVG : un format d'image composé de traits et de
   textes décrits par leurs coordonnées. Son gros avantage : il reste net
   quelle que soit la taille de l'écran.

   Le repère du système SVG :
     - x augmente vers la DROITE
     - y augmente vers le BAS (attention, c'est l'inverse des maths !)

   Les nombres ci-dessous sont des positions dans le dessin. On les range
   dans des variables pour pouvoir déplacer la droite sans tout casser.
   ======================================================================= */

const AXE_LARGEUR = 400; // largeur totale du dessin
const AXE_HAUTEUR = 138; // hauteur totale du dessin
const AXE_GAUCHE = 24;   // x du zéro
const AXE_DROITE = 352;  // x du dernier entier gradué
const AXE_Y = 92;        // hauteur de la ligne horizontale
const AXE_NOMBRES_Y = 128; /* hauteur des nombres écrits sous la droite.
                              Bien plus bas que les graduations (qui
                              descendent jusqu'à 104) : sans cet écart,
                              les chiffres collent à la droite. */

/* Au-delà de ce nombre de petites graduations, on ne les dessine plus :
   ça deviendrait un peigne illisible (imagine 63 traits côte à côte). */
const AXE_MAX_GRADUATIONS = 30;

/* Jusqu'où on marque les demis (0,5 ; 1,5 ; 2,5...). Au-delà, la droite
   est déjà bien assez remplie par les entiers. */
const AXE_MAX_DEMIS = 6;


/* dessinerDemiDroite(3, 4)  ->  le HTML d'une demi-droite où 3/4 est
   repéré entre 0 et 1, suivi d'une petite phrase d'encadrement. */
function dessinerDemiDroite(haut, bas) {
  const valeur = haut / bas;

  /* Jusqu'où va la graduation ? Toujours UN entier après la fraction,
     pour que le repère ne se retrouve jamais collé au bord droit.
     Math.floor arrondit vers le bas : floor(1.75) = 1, donc fin = 2. */
  const fin = Math.floor(valeur) + 1;

  // Combien de pixels séparent deux entiers.
  const unite = (AXE_DROITE - AXE_GAUCHE) / fin;

  /* La conversion "nombre -> position sur le dessin". On s'en sert
     partout en dessous, donc on l'écrit une fois pour toutes ici. */
  function positionDe(nombre) {
    return AXE_GAUCHE + nombre * unite;
  }

  const xRepere = positionDe(valeur);
  let dessin = "";

  /* --- 1. La ligne, avec sa flèche : une demi-droite ne s'arrête pas --- */
  dessin +=
    '<line class="axe-ligne" x1="' + AXE_GAUCHE + '" y1="' + AXE_Y +
    '" x2="390" y2="' + AXE_Y + '" />';
  dessin +=
    '<path class="axe-fleche" d="M377 ' + (AXE_Y - 9) +
    ' L390 ' + AXE_Y + ' L377 ' + (AXE_Y + 9) + '" />';

  /* --- 2. Le chemin parcouru depuis zéro ---
     La portion de droite entre 0 et la fraction passe en orange vif et
     bien plus épaisse : on voit d'un coup d'œil "quelle quantité ça fait".
     On la trace AVANT les graduations, pour que celles-ci restent
     visibles par-dessus et qu'on puisse compter les parts. */
  dessin +=
    '<line class="axe-parcours" x1="' + AXE_GAUCHE + '" y1="' + AXE_Y +
    '" x2="' + xRepere + '" y2="' + AXE_Y + '" />';

  /* --- 3. Les petites graduations, une par part de fraction ---
     Pour 3/4, on découpe chaque unité en 4 : l'enfant peut COMPTER les
     parts jusqu'au repère au lieu de croire le dessin sur parole. */
  const nombreDeParts = fin * bas;

  if (bas > 1 && nombreDeParts <= AXE_MAX_GRADUATIONS) {
    for (let i = 1; i < nombreDeParts; i++) {
      // Les multiples de "bas" tombent sur un entier : ils sont tracés
      // juste en dessous, en plus grand. Inutile de les doubler ici.
      if (i % bas !== 0) {
        const x = positionDe(i / bas);
        dessin +=
          '<line class="axe-petite" x1="' + x + '" y1="' + (AXE_Y - 7) +
          '" x2="' + x + '" y2="' + (AXE_Y + 7) + '" />';
      }
    }
  }

  /* --- 4. LES DEMIS : le repère le plus utile après les entiers ---
     « Est-ce plus grand ou plus petit qu'un demi ? » est LA question qui
     revient tout le temps. On marque donc chaque demi d'une graduation
     de taille intermédiaire — plus grande que les parts, plus petite que
     les entiers — et on écrit "1/2" sous la première, pour que l'œil
     ait un point d'appui au milieu. */
  if (fin <= AXE_MAX_DEMIS) {
    for (let n = 0; n < fin; n++) {
      const x = positionDe(n + 0.5);
      dessin +=
        '<line class="axe-demi" x1="' + x + '" y1="' + (AXE_Y - 10) +
        '" x2="' + x + '" y2="' + (AXE_Y + 10) + '" />';
    }

    /* On n'écrit "1/2" que si la droite est courte : au-delà, 0 et 1
       sont déjà si proches que l'étiquette se cognerait à eux. */
    if (fin <= 4) {
      dessin +=
        '<text class="axe-demi-nombre" x="' + positionDe(0.5) +
        '" y="' + AXE_NOMBRES_Y + '">1/2</text>';
    }
  }

  /* --- 5. Les entiers : graduations plus grandes, et leur numéro ---
     Si la droite va très loin (0 à 20), on n'écrit pas les 21 nombres :
     on n'en écrit qu'un de temps en temps pour ne pas tout tasser. */
  const pasDesNombres = fin <= 10 ? 1 : Math.ceil(fin / 10);

  for (let n = 0; n <= fin; n++) {
    const x = positionDe(n);

    dessin +=
      '<line class="axe-entier" x1="' + x + '" y1="' + (AXE_Y - 12) +
      '" x2="' + x + '" y2="' + (AXE_Y + 12) + '" />';

    if (n % pasDesNombres === 0) {
      dessin +=
        '<text class="axe-nombre" x="' + x + '" y="' + AXE_NOMBRES_Y + '">' +
        n + "</text>";
    }
  }

  /* --- 6. Le repère : un trait vertical et une pointe triangulaire ---
     Le trait part de plus haut pour une fraction (écrite sur deux
     lignes) que pour un entier (écrit sur une seule). */
  const hautDuTrait = bas === 1 ? 54 : 62;

  dessin +=
    '<line class="axe-repere" x1="' + xRepere + '" y1="' + hautDuTrait +
    '" x2="' + xRepere + '" y2="' + (AXE_Y - 16) + '" />';
  dessin +=
    '<path class="axe-pointe" d="M' + (xRepere - 9) + " " + (AXE_Y - 16) +
    " L" + (xRepere + 9) + " " + (AXE_Y - 16) +
    " L" + xRepere + " " + AXE_Y + ' Z" />';

  /* --- 7. La fraction écrite au-dessus du repère ---
     C'est le 3e signal, le plus important : même sans distinguer le
     vert, on lit le nombre qui est placé là.

     On empêche l'étiquette de dépasser du dessin en la ramenant vers
     l'intérieur si le repère est tout au bord. */
  const xEtiquette = Math.min(Math.max(xRepere, 24), AXE_LARGEUR - 24);

  if (bas === 1) {
    // Un entier s'écrit sur une seule ligne, sans barre de fraction.
    dessin +=
      '<text class="axe-etiquette" x="' + xEtiquette + '" y="44">' +
      haut + "</text>";
  } else {
    // La largeur du trait de fraction s'adapte au nombre de chiffres.
    const chiffres = Math.max(String(haut).length, String(bas).length);
    const demiBarre = 7 + 7 * chiffres;

    dessin +=
      '<text class="axe-etiquette" x="' + xEtiquette + '" y="22">' +
      haut + "</text>";
    dessin +=
      '<line class="axe-barre" x1="' + (xEtiquette - demiBarre) +
      '" y1="30" x2="' + (xEtiquette + demiBarre) + '" y2="30" />';
    dessin +=
      '<text class="axe-etiquette" x="' + xEtiquette + '" y="54">' +
      bas + "</text>";
  }

  /* --- 8. La phrase d'encadrement ---
     "entre 0 et 1" : c'est exactement ce qu'on demande en 6e sous le nom
     d'"encadrer une fraction entre deux entiers consécutifs". */
  const entierAvant = Math.floor(valeur);
  let legende;
  let description;

  if (bas === 1) {
    legende =
      "<strong>" + haut + "</strong> est un nombre entier :" +
      " il tombe pile sur une graduation.";
    description =
      "Demi-droite graduée : le nombre entier " + haut + " est repéré.";
  } else {
    legende =
      "<strong>" + haut + "/" + bas + "</strong> est entre <strong>" +
      entierAvant + "</strong> et <strong>" + (entierAvant + 1) +
      "</strong>.";
    description =
      "Demi-droite graduée : " + haut + " sur " + bas +
      " est repéré entre " + entierAvant + " et " + (entierAvant + 1) + ".";
  }

  /* role="img" et aria-label : pour un lecteur d'écran, le dessin est
     une image, décrite par cette phrase. */
  return (
    '<svg class="axe-dessin" viewBox="0 0 ' + AXE_LARGEUR + " " + AXE_HAUTEUR +
      '" role="img" aria-label="' + echapper(description) + '">' +
      dessin +
    "</svg>" +
    '<p class="axe-legende">' + legende + "</p>"
  );
}
