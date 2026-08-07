/* =======================================================================
   3-EXERCICES.JS  —  La fabrique d'exercices.

   Il y a sept sortes d'exercices, donc sept fonctions :

     CALCULER
     genererSimplification()     ->  8/6  devient  4/3
     genererSommeDifference()    ->  1/4 + 2/3
     genererMultiplication()     ->  2/3 × 3/5

     COMPRENDRE CE QU'EST UNE FRACTION
     genererQuantite()           ->  les 3/4 de 20 €
     genererComparaison()        ->  1/3 ou 2/5 : laquelle est la plus grande ?
     genererEncadrement()        ->  7/4 = 1 + 3/4, entre 1 et 2
     genererDecimalPourcentage() ->  3/4 = 0,75 = 75 %

   Les quatre dernières ne sont pas des calculs : elles travaillent le
   SENS de la fraction. C'est ce qui est le plus demandé en 6e, et c'est
   souvent ce qui manque quand "les fractions ne rentrent pas".

   Tout en bas du fichier, la liste FABRIQUES relie chaque nom de mode à
   sa fonction : c'est elle que lit l'application.

   Chacune renvoie une LISTE D'ÉTAPES. Une étape ressemble à ceci :

     {
       calcul: [ ...les boîtes à dessiner... ],
       explication: "la phrase affichée sous le calcul",
       termine: true,              (seulement pour la toute dernière étape)
       valeur: { haut: 3, bas: 4 } (seulement pour le RÉSULTAT FINAL)
     }

   Un clic sur la carte = on passe à l'étape suivante de la liste.

   À quoi sert "valeur" ? Quand une étape en porte une, l'application
   dessine en dessous une DEMI-DROITE GRADUÉE et y place le résultat.
   On ne la met donc que sur l'étape qui montre la fraction irréductible :
   tant qu'on peut encore simplifier, ce n'est pas le nombre final.

   Le "niveau" ("facile", "moyen" ou "costaud") sert à choisir des
   nombres plus ou moins gros.
   ======================================================================= */

"use strict";


/* =======================================================================
   EXERCICE 1 : SIMPLIFIER UNE FRACTION
   Exemple :  8/6  ->  4 × 2 / 3 × 2  ->  4/3

   Astuce de fabrication : on ne part PAS de 8/6 pour chercher comment le
   simplifier. On fait l'inverse ! On choisit d'abord la réponse (4/3),
   puis un facteur (2), et on multiplie pour obtenir l'énoncé (8/6).
   Comme ça, on est sûr que l'exercice tombe juste.
   ======================================================================= */
function genererSimplification(niveau) {
  // Des nombres de plus en plus grands selon le niveau.
  let denominateurMax = 6;
  let facteurMax = 3;

  if (niveau === "moyen") {
    denominateurMax = 9;
    facteurMax = 5;
  } else if (niveau === "costaud") {
    denominateurMax = 12;
    facteurMax = 7;
  }

  // 1) On tire la RÉPONSE au hasard : une fraction déjà irréductible.
  //    "irréductible" veut dire qu'on ne peut plus la simplifier,
  //    donc que son PGCD vaut 1.
  let haut;
  let bas;

  do {
    bas = alea(2, denominateurMax);
    haut = alea(1, denominateurMax + 2);
  } while (pgcd(haut, bas) !== 1 || haut === bas);
  // do...while = "recommence tant que la condition est vraie"

  // 2) On tire le facteur commun, puis on fabrique l'énoncé.
  const facteur = alea(2, facteurMax);
  const enonceHaut = haut * facteur;
  const enonceBas = bas * facteur;

  // 3) On écrit les étapes, dans l'ordre.
  const etapes = [
    {
      calcul: [fraction([morceau(enonceHaut)], [morceau(enonceBas)])],
      explication:
        "Simplifie cette fraction. <strong>Clique</strong> pour voir la première étape."
    },
    {
      calcul: [
        fraction(
          [morceau(haut), morceau(" × " + facteur, true)],
          [morceau(bas), morceau(" × " + facteur, true)]
        )
      ],
      explication:
        enonceHaut + " et " + enonceBas +
        " sont tous les deux dans la table de <strong>" + facteur + "</strong>" +
        " : on écrit " + enonceHaut + " = " + haut + " × " + facteur +
        " et " + enonceBas + " = " + bas + " × " + facteur + "."
    },
    {
      calcul: [fraction([morceau(haut)], [morceau(bas)])],
      explication:
        "On barre le <strong>× " + facteur + "</strong> en haut et en bas :" +
        " il reste " + haut + "/" + bas + ", la fraction irréductible.",
      termine: true,
      valeur: { haut: haut, bas: bas }
    }
  ];

  // Cas bonus : si la fraction tombe sur un nombre entier, on le dit.
  if (haut % bas === 0) {
    etapes.push({
      calcul: [entier(haut / bas)],
      explication:
        "Et " + haut + "/" + bas + " vaut exactement <strong>" +
        (haut / bas) + "</strong>.",
      termine: true,
      valeur: { haut: haut / bas, bas: 1 }
    });
  }

  return etapes;
}


/* =======================================================================
   EXERCICE 2 : ADDITION OU SOUSTRACTION
   Exemple :  1/4 + 2/3

   La règle : on ne peut additionner que des parts de MÊME TAILLE.
   Il faut donc d'abord mettre les deux fractions sur le même
   dénominateur (avec le PPCM), puis additionner les numérateurs.
   ======================================================================= */
function genererSommeDifference(niveau) {
  let bas1;
  let bas2;

  if (niveau === "facile") {
    // Les deux dénominateurs sont identiques : il n'y a rien à préparer.
    bas1 = alea(3, 10);
    bas2 = bas1;
  } else if (niveau === "moyen") {
    // Un dénominateur est dans la table de l'autre (4 et 12 par exemple).
    bas1 = alea(2, 6);
    bas2 = bas1 * alea(2, 4);

    if (Math.random() < 0.5) {
      // Une fois sur deux, on échange les deux pour varier.
      const memoire = bas1;
      bas1 = bas2;
      bas2 = memoire;
    }
  } else {
    // Dénominateurs sans rapport : il faut vraiment chercher le PPCM.
    do {
      bas1 = alea(2, 9);
      bas2 = alea(2, 9);
    } while (bas1 === bas2 || bas2 % bas1 === 0 || bas1 % bas2 === 0);
  }

  // Des numérateurs plus petits que les dénominateurs.
  let haut1 = alea(1, bas1 - 1);
  let haut2 = alea(1, bas2 - 1);

  const commun = ppcm(bas1, bas2); // le dénominateur commun
  const symbole = Math.random() < 0.5 ? "+" : "−";

  // En 6e, on ne veut pas de résultat négatif : pour une soustraction,
  // on met la plus grande fraction en premier. Pour les comparer, on
  // regarde ce que vaudrait chaque numérateur une fois sur le commun.
  if (symbole === "−" && haut1 * (commun / bas1) < haut2 * (commun / bas2)) {
    let memoire = haut1; haut1 = haut2; haut2 = memoire;
    memoire = bas1; bas1 = bas2; bas2 = memoire;
  }

  // Par combien faut-il multiplier chaque fraction ?
  const facteur1 = commun / bas1;
  const facteur2 = commun / bas2;

  // Les numérateurs une fois mis sur le dénominateur commun.
  const nouveauHaut1 = haut1 * facteur1;
  const nouveauHaut2 = haut2 * facteur2;

  // Le résultat, avant simplification.
  const resultat =
    symbole === "+"
      ? nouveauHaut1 + nouveauHaut2
      : nouveauHaut1 - nouveauHaut2;

  const etapes = [];

  // --- Étape 1 : l'énoncé ---
  etapes.push({
    calcul: [
      fraction([morceau(haut1)], [morceau(bas1)]),
      operation(symbole),
      fraction([morceau(haut2)], [morceau(bas2)])
    ],
    explication:
      symbole === "+"
        ? "Calcule cette somme. <strong>Clique</strong> pour la suite."
        : "Calcule cette différence. <strong>Clique</strong> pour la suite."
  });

  // --- Étape 2 : le même dénominateur (seulement si c'est nécessaire) ---
  if (facteur1 > 1 || facteur2 > 1) {
    etapes.push({
      calcul: [
        facteur1 > 1
          ? fraction(
              [morceau(haut1), morceau(" × " + facteur1, true)],
              [morceau(bas1), morceau(" × " + facteur1, true)]
            )
          : fraction([morceau(haut1)], [morceau(bas1)]),
        operation(symbole),
        facteur2 > 1
          ? fraction(
              [morceau(haut2), morceau(" × " + facteur2, true)],
              [morceau(bas2), morceau(" × " + facteur2, true)]
            )
          : fraction([morceau(haut2)], [morceau(bas2)])
      ],
      explication:
        "On ne peut additionner que des parts de même taille : on met tout" +
        " sur <strong>" + commun + "</strong>, un multiple commun de " +
        bas1 + " et " + bas2 + "."
    });

    etapes.push({
      calcul: [
        fraction([morceau(nouveauHaut1)], [morceau(commun)]),
        operation(symbole),
        fraction([morceau(nouveauHaut2)], [morceau(commun)])
      ],
      explication:
        "Les deux fractions ont maintenant le même dénominateur :" +
        " <strong>" + commun + "</strong>."
    });
  } else {
    etapes.push({
      calcul: [
        fraction([morceau(haut1)], [morceau(bas1)]),
        operation(symbole),
        fraction([morceau(haut2)], [morceau(bas2)])
      ],
      explication:
        "Les dénominateurs sont déjà les mêmes (<strong>" + commun +
        "</strong>) : rien à changer."
    });
  }

  // --- Étape 3 : on additionne SEULEMENT les numérateurs ---
  etapes.push({
    calcul: [
      fraction(
        [
          morceau(nouveauHaut1, true),
          morceau(" " + symbole + " ", true),
          morceau(nouveauHaut2, true)
        ],
        [morceau(commun)]
      )
    ],
    explication:
      "On garde le dénominateur " + commun + " et on calcule seulement les" +
      " numérateurs : " + nouveauHaut1 + " " + symbole + " " + nouveauHaut2 + "."
  });

  // --- Cas particulier : les deux fractions étaient égales ---
  if (resultat === 0) {
    etapes.push({
      calcul: [entier(0)],
      explication:
        nouveauHaut1 + " " + symbole + " " + nouveauHaut2 +
        " = <strong>0</strong> : les deux fractions étaient égales," +
        " il ne reste rien.",
      termine: true,
      valeur: { haut: 0, bas: 1 }
    });

    return etapes;
  }

  // --- Étape 4 : le résultat, puis la simplification si besoin ---
  ajouterResultatEtSimplification(etapes, resultat, commun,
    nouveauHaut1 + " " + symbole + " " + nouveauHaut2 + " = ");

  return etapes;
}


/* =======================================================================
   EXERCICE 3 : MULTIPLICATION
   Exemple :  2/3 × 4/5  =  8/15

   Bonne nouvelle : c'est BEAUCOUP plus simple que l'addition !
   Pas besoin de dénominateur commun. On multiplie les numérateurs
   entre eux, et les dénominateurs entre eux. C'est tout.
   ======================================================================= */
function genererMultiplication(niveau) {
  // On garde des nombres raisonnables : en multipliant, ça grandit vite.
  let denominateurMax = 5;
  let numerateurMax = 4;

  if (niveau === "moyen") {
    denominateurMax = 7;
    numerateurMax = 6;
  } else if (niveau === "costaud") {
    denominateurMax = 10;
    numerateurMax = 9;
  }

  const bas1 = alea(2, denominateurMax);
  const bas2 = alea(2, denominateurMax);
  const haut1 = alea(1, numerateurMax);
  const haut2 = alea(1, numerateurMax);

  const produitHaut = haut1 * haut2;
  const produitBas = bas1 * bas2;

  const etapes = [];

  // --- Étape 1 : l'énoncé ---
  etapes.push({
    calcul: [
      fraction([morceau(haut1)], [morceau(bas1)]),
      operation("×"),
      fraction([morceau(haut2)], [morceau(bas2)])
    ],
    explication:
      "Multiplie ces deux fractions. <strong>Clique</strong> pour la suite."
  });

  // --- Étape 2 : la règle, écrite en toutes lettres ---
  etapes.push({
    calcul: [
      fraction(
        [morceau(haut1 + " × " + haut2, true)],
        [morceau(bas1 + " × " + bas2, true)]
      )
    ],
    explication:
      "Pour multiplier, pas besoin de dénominateur commun ! On multiplie" +
      " les <strong>numérateurs entre eux</strong> et les" +
      " <strong>dénominateurs entre eux</strong>."
  });

  // --- Étape 3 : le résultat, puis la simplification si besoin ---
  ajouterResultatEtSimplification(etapes, produitHaut, produitBas,
    haut1 + " × " + haut2 + " = " + produitHaut + " et " +
    bas1 + " × " + bas2 + " = " + produitBas + ". ");

  return etapes;
}


/* =======================================================================
   OUTIL COMMUN AUX EXERCICES 2 ET 3

   La fin est la même pour l'addition et pour la multiplication :
   on affiche le résultat, puis on le simplifie s'il peut l'être.
   Plutôt que d'écrire ce code deux fois, on l'écrit ici une seule fois.

     etapes   : la liste d'étapes à compléter
     haut/bas : le résultat trouvé, avant simplification
     debut    : le début de la phrase d'explication
   ======================================================================= */
function ajouterResultatEtSimplification(etapes, haut, bas, debut) {
  // Par combien peut-on encore simplifier ? Le PGCD nous le dit.
  const facteur = pgcd(haut, bas);

  etapes.push({
    calcul: [fractionOuEntier(haut, bas)],
    explication:
      facteur > 1
        ? debut + "Attention, cette fraction peut encore être simplifiée !"
        : debut + "La fraction est déjà irréductible.",
    // Si le PGCD vaut 1, on ne peut plus rien simplifier : c'est fini.
    termine: facteur === 1,
    // ...et dans ce cas seulement, c'est le nombre à placer sur la
    // demi-droite. Sinon on attend la simplification, deux étapes plus bas.
    valeur: facteur === 1 ? { haut: haut, bas: bas } : null
  });

  if (facteur > 1) {
    const hautFinal = haut / facteur;
    const basFinal = bas / facteur;

    etapes.push({
      calcul: [
        fraction(
          [morceau(hautFinal), morceau(" × " + facteur, true)],
          [morceau(basFinal), morceau(" × " + facteur, true)]
        )
      ],
      explication:
        haut + " et " + bas + " sont tous les deux dans la table de" +
        " <strong>" + facteur + "</strong>."
    });

    etapes.push({
      calcul: [fractionOuEntier(hautFinal, basFinal)],
      explication:
        basFinal === 1
          ? "On simplifie par " + facteur + " : le résultat est l'entier" +
            " <strong>" + hautFinal + "</strong>."
          : "On simplifie par " + facteur + " : le résultat est" +
            " <strong>" + hautFinal + "/" + basFinal + "</strong>.",
      termine: true,
      valeur: { haut: hautFinal, bas: basFinal }
    });
  }
}


/* =======================================================================
   EXERCICE 4 : PRENDRE UNE FRACTION D'UNE QUANTITÉ
   Exemple :  les 3/4 de 20 €  ->  15 €

   La méthode de 6e tient en deux gestes :
     1. on PARTAGE  : 20 ÷ 4 = 5   (ce que vaut une part)
     2. on en PREND : 5 × 3 = 15   (trois parts)

   Astuce de fabrication : on choisit d'abord la valeur d'UNE part, puis
   on multiplie pour obtenir le total. La division tombe donc toujours
   juste, et l'énoncé reste un vrai problème de 6e.
   ======================================================================= */

/* Les petites histoires. {TOTAL} et {FRACTION} sont remplacés par les
   vrais nombres au moment de fabriquer l'exercice.

   Deux règles d'écriture, pour que le français reste correct :
     - {FRACTION} n'est jamais en début de phrase (sinon il faudrait une
       majuscule qu'on ne peut pas deviner) ;
     - on dit toujours "les 3/4", jamais "le 1/3" — c'est pour ça que le
       numérateur tiré plus bas vaut au minimum 2. */
const HISTOIRES = [
  {
    enonce: "Paul a {TOTAL} €, et en dépense {FRACTION}.",
    question: "Combien d'euros dépensés ?",
    unite: "€"
  },
  {
    enonce: "Dans une classe de {TOTAL} élèves, {FRACTION} sont demi-pensionnaires.",
    question: "Combien d'élèves ?",
    unite: "élèves"
  },
  {
    enonce: "Un sac contient {TOTAL} billes. On en prend {FRACTION}.",
    question: "Combien de billes ?",
    unite: "billes"
  },
  {
    enonce: "Une tablette a {TOTAL} carrés de chocolat. On en mange {FRACTION}.",
    question: "Combien de carrés ?",
    unite: "carrés"
  },
  {
    enonce: "Léa parcourt {FRACTION} d'un trajet de {TOTAL} km.",
    question: "Combien de kilomètres ?",
    unite: "km"
  },
  {
    enonce: "Un livre a {TOTAL} pages. Hugo en a lu {FRACTION}.",
    question: "Combien de pages ?",
    unite: "pages"
  }
];


function genererQuantite(niveau) {
  // "bas" = en combien de parts on partage. "part" = ce que vaut une part.
  let basMax = 5;
  let partMin = 2;
  let partMax = 5;

  if (niveau === "moyen") {
    basMax = 6;
    partMin = 3;
    partMax = 12;
  } else if (niveau === "costaud") {
    basMax = 8;
    partMin = 4;
    partMax = 15;
  }

  const bas = alea(3, basMax);
  const part = alea(partMin, partMax);
  const haut = alea(2, bas - 1); // au moins 2 : on dit "les 3/4"
  const total = bas * part;
  const resultat = haut * part;

  const histoire = choix(HISTOIRES);
  const enonce = histoire.enonce
    .replace("{TOTAL}", total)
    .replace("{FRACTION}", "les <strong>" + haut + "/" + bas + "</strong>");

  return [
    {
      calcul: [
        fraction([morceau(haut)], [morceau(bas)]),
        mot("de"),
        entier(total + " " + histoire.unite)
      ],
      explication: enonce + " <strong>" + histoire.question + "</strong>"
    },
    {
      calcul: [
        entier(total),
        operation("÷"),
        entier(bas),
        operation("="),
        entier(part)
      ],
      explication:
        "Prendre les " + haut + "/" + bas + ", c'est d'abord partager en <strong>" +
        bas + "</strong> parts égales. Une part vaut " + total + " ÷ " + bas +
        " = <strong>" + part + "</strong>."
    },
    {
      calcul: [entier(resultat + " " + histoire.unite)],
      explication:
        "Puis on en prend <strong>" + haut + "</strong> : " + part + " × " +
        haut + " = <strong>" + resultat + "</strong>.",
      termine: true
    }
  ];
}


/* =======================================================================
   EXERCICE 5 : COMPARER DEUX FRACTIONS
   Exemple :  1/3 ou 2/5 ?

   La règle : on ne peut comparer que des parts de MÊME TAILLE. On met
   donc les deux fractions sur le même dénominateur, puis il suffit de
   regarder les numérateurs.

   Une fois sur quatre, la deuxième fraction est 1/2 : "est-ce plus grand
   ou plus petit qu'un demi ?" est la question de repérage qui revient le
   plus souvent en contrôle.
   ======================================================================= */
function genererComparaison(niveau) {
  let bas1;
  let bas2;
  let haut1;
  let haut2;
  let commun;
  let nouveau1;
  let nouveau2;

  /* On retire tant que les deux fractions sont ÉGALES : il n'y aurait
     alors rien à comparer (1/2 et 2/4, par exemple). */
  do {
    if (niveau === "facile") {
      // Même dénominateur : il n'y a rien à préparer.
      bas1 = alea(3, 10);
      bas2 = bas1;
    } else if (niveau === "moyen") {
      // Un dénominateur est dans la table de l'autre.
      bas1 = alea(2, 6);
      bas2 = bas1 * alea(2, 4);

      if (Math.random() < 0.5) {
        const memoire = bas1;
        bas1 = bas2;
        bas2 = memoire;
      }
    } else {
      // Dénominateurs sans rapport : il faut vraiment chercher le PPCM.
      do {
        bas1 = alea(2, 9);
        bas2 = alea(2, 9);
      } while (bas1 === bas2 || bas2 % bas1 === 0 || bas1 % bas2 === 0);
    }

    haut1 = alea(1, bas1 - 1);
    haut2 = alea(1, bas2 - 1);

    // Une fois sur quatre : la comparaison au demi.
    if (niveau !== "facile" && Math.random() < 0.25) {
      bas2 = 2;
      haut2 = 1;
    }

    commun = ppcm(bas1, bas2);
    nouveau1 = haut1 * (commun / bas1);
    nouveau2 = haut2 * (commun / bas2);
  } while (nouveau1 === nouveau2);

  const symbole = nouveau1 < nouveau2 ? "<" : ">";
  // En toutes lettres : plus clair qu'un symbole dans une phrase.
  const enMots = nouveau1 < nouveau2 ? "plus petite que" : "plus grande que";

  const premiere = fraction([morceau(haut1)], [morceau(bas1)]);
  const seconde = fraction([morceau(haut2)], [morceau(bas2)]);

  const etapes = [
    {
      calcul: [premiere, operation("?"), seconde],
      explication:
        "Laquelle est la plus grande ? <strong>Clique</strong> pour la suite."
    }
  ];

  if (commun === bas1 && commun === bas2) {
    etapes.push({
      calcul: [premiere, operation("?"), seconde],
      explication:
        "Les dénominateurs sont déjà les mêmes (<strong>" + commun +
        "</strong>) : les parts ont la même taille, il suffit de comparer" +
        " les numérateurs."
    });
  } else {
    etapes.push({
      calcul: [
        commun === bas1
          ? premiere
          : fraction(
              [morceau(haut1), morceau(" × " + commun / bas1, true)],
              [morceau(bas1), morceau(" × " + commun / bas1, true)]
            ),
        operation("?"),
        commun === bas2
          ? seconde
          : fraction(
              [morceau(haut2), morceau(" × " + commun / bas2, true)],
              [morceau(bas2), morceau(" × " + commun / bas2, true)]
            )
      ],
      explication:
        "On ne peut comparer que des parts de même taille : on met tout" +
        " sur <strong>" + commun + "</strong>."
    });

    etapes.push({
      calcul: [
        fraction([morceau(nouveau1)], [morceau(commun)]),
        operation("?"),
        fraction([morceau(nouveau2)], [morceau(commun)])
      ],
      explication:
        "Même dénominateur : la plus grande est celle qui a le plus grand" +
        " numérateur."
    });
  }

  etapes.push({
    calcul: [premiere, operation(symbole), seconde],
    explication:
      "On compare les numérateurs : <strong>" + nouveau1 + "</strong> et <strong>" +
      nouveau2 + "</strong>. Donc <strong>" + haut1 + "/" + bas1 +
      "</strong> est " + enMots + " <strong>" + haut2 + "/" + bas2 + "</strong>.",
    termine: true
  });

  return etapes;
}


/* =======================================================================
   EXERCICE 6 : ENCADRER UNE FRACTION / EN SORTIR LA PARTIE ENTIÈRE
   Exemple :  7/4 = 1 + 3/4, donc 7/4 est entre 1 et 2

   C'est ce qui donne du SENS aux fractions plus grandes que 1. L'outil :
   la division euclidienne, 7 = 1 × 4 + 3. Le quotient donne la partie
   entière, le reste donne ce qui dépasse.
   ======================================================================= */
function genererEncadrement(niveau) {
  let basMax = 5;
  let quotientMax = 3;

  if (niveau === "moyen") {
    basMax = 9;
    quotientMax = 5;
  } else if (niveau === "costaud") {
    basMax = 12;
    quotientMax = 8;
  }

  const bas = alea(2, basMax);
  const quotient = alea(1, quotientMax);
  const reste = alea(1, bas - 1); // jamais 0 : sinon ce serait un entier
  const haut = quotient * bas + reste;

  return [
    {
      calcul: [fraction([morceau(haut)], [morceau(bas)])],
      explication:
        "Entre quels deux nombres entiers se trouve cette fraction ?" +
        " <strong>Clique</strong> pour la suite."
    },
    {
      calcul: [
        entier(haut),
        operation("="),
        entier(quotient),
        operation("×"),
        entier(bas),
        operation("+"),
        entier(reste)
      ],
      explication:
        "Combien de fois <strong>" + bas + "</strong> tient-il dans " + haut +
        " ? <strong>" + quotient + "</strong> fois, et il reste <strong>" +
        reste + "</strong>."
    },
    {
      calcul: [
        entier(quotient),
        operation("+"),
        fraction([morceau(reste)], [morceau(bas)])
      ],
      explication:
        haut + "/" + bas + " = <strong>" + quotient + "</strong> + " + reste +
        "/" + bas + ". Comme " + reste + "/" + bas + " est plus petit que 1," +
        " la fraction est entre <strong>" + quotient + "</strong> et <strong>" +
        (quotient + 1) + "</strong>.",
      termine: true,
      valeur: { haut: haut, bas: bas }
    }
  ];
}


/* =======================================================================
   EXERCICE 7 : FRACTION -> NOMBRE DÉCIMAL -> POURCENTAGE
   Exemple :  3/4 = 0,75 = 75 %

   C'est le pont entre les fractions et tout le reste du programme. Les
   deux idées : une fraction est une DIVISION, et un pourcentage est une
   fraction dont le dénominateur est 100.

   On ne tire que des dénominateurs qui "tombent juste" en décimal
   (2, 4, 5, 8, 10, 20, 25, 40) : sinon 1/3 donnerait 0,333333...
   ======================================================================= */
function genererDecimalPourcentage(niveau) {
  let denominateurs = [2, 4, 5, 10];

  if (niveau === "moyen") {
    denominateurs = [5, 8, 10, 20];
  } else if (niveau === "costaud") {
    denominateurs = [8, 20, 25, 40];
  }

  let bas;
  let haut;

  // On veut une fraction irréductible : 2/4 s'écrirait plutôt 1/2.
  do {
    bas = choix(denominateurs);
    haut = alea(1, bas - 1);
  } while (pgcd(haut, bas) !== 1);

  const decimal = nombreFrancais(haut / bas);
  const pourcentage = nombreFrancais((haut / bas) * 100);

  const laFraction = fraction([morceau(haut)], [morceau(bas)]);

  return [
    {
      calcul: [laFraction],
      explication:
        "Écris cette fraction en nombre décimal, puis en pourcentage." +
        " <strong>Clique</strong> pour la suite."
    },
    {
      calcul: [laFraction, operation("="), entier(decimal)],
      explication:
        "Une fraction, c'est une division : " + haut + " ÷ " + bas +
        " = <strong>" + decimal + "</strong>."
    },
    {
      calcul: [
        laFraction,
        operation("="),
        entier(decimal),
        operation("="),
        entier(pourcentage + " %")
      ],
      explication:
        "Un pourcentage, c'est « sur 100 » : on multiplie par 100. " +
        decimal + " × 100 = <strong>" + pourcentage + "</strong> %.",
      termine: true,
      valeur: { haut: haut, bas: bas }
    }
  ];
}


/* =======================================================================
   LA LISTE DES FABRIQUES

   Chaque nom de mode (celui écrit dans data-mode, dans index.html) est
   relié à la fonction qui sait fabriquer cet exercice.

   POUR AJOUTER UN NOUVEL EXERCICE, il suffit de :
     1. écrire une fonction genererMachin(niveau) au-dessus,
     2. ajouter une ligne ici,
     3. ajouter un bouton data-mode="machin" dans index.html.
   Le mode "Mélange" le prendra en compte tout seul.
   ======================================================================= */
const FABRIQUES = {
  simplifier: genererSimplification,
  somme: genererSommeDifference,
  multiplication: genererMultiplication,
  quantite: genererQuantite,
  comparer: genererComparaison,
  encadrer: genererEncadrement,
  decimal: genererDecimalPourcentage
};
