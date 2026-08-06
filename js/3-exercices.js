/* =======================================================================
   3-EXERCICES.JS  —  La fabrique d'exercices.

   Il y a trois sortes d'exercices, donc trois fonctions :

     genererSimplification()  ->  8/6  devient  4/3
     genererSommeDifference() ->  1/4 + 2/3
     genererMultiplication()  ->  2/3 × 3/5

   Chacune renvoie une LISTE D'ÉTAPES. Une étape ressemble à ceci :

     {
       calcul: [ ...les boîtes à dessiner... ],
       explication: "la phrase affichée sous le calcul",
       termine: true   (seulement pour la toute dernière étape)
     }

   Un clic sur la carte = on passe à l'étape suivante de la liste.

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
      termine: true
    }
  ];

  // Cas bonus : si la fraction tombe sur un nombre entier, on le dit.
  if (haut % bas === 0) {
    etapes.push({
      calcul: [entier(haut / bas)],
      explication:
        "Et " + haut + "/" + bas + " vaut exactement <strong>" +
        (haut / bas) + "</strong>.",
      termine: true
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
      termine: true
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
    termine: facteur === 1
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
      termine: true
    });
  }
}
