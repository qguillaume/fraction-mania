/* =======================================================================
   1-OUTILS.JS  —  Les petites fonctions de maths dont on se sert partout.

   Une "fonction", c'est une machine : on lui donne des nombres, elle
   renvoie un résultat. On l'écrit une seule fois, puis on la réutilise
   autant de fois qu'on veut.

   Ce fichier est chargé EN PREMIER, car tous les autres s'en servent.
   ======================================================================= */

/* "use strict" demande au navigateur d'être sévère : il signale les
   erreurs au lieu de les laisser passer en silence. */
"use strict";


/* -----------------------------------------------------------------------
   alea(min, max)  ->  un nombre entier au hasard entre min et max
                       (min et max compris)

   Exemple :  alea(2, 6)  peut donner  2, 3, 4, 5 ou 6.

   Math.random() donne un nombre à virgule entre 0 et 1 (par ex. 0.734).
   On l'étale sur la bonne longueur, puis Math.floor arrondit vers le bas.
   ----------------------------------------------------------------------- */
function alea(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}


/* -----------------------------------------------------------------------
   choix(liste)  ->  un élément au hasard dans une liste

   Exemple :  choix(["simplifier", "somme"])  donne l'un des deux mots.
   ----------------------------------------------------------------------- */
function choix(liste) {
  return liste[alea(0, liste.length - 1)];
}


/* -----------------------------------------------------------------------
   pgcd(a, b)  ->  le Plus Grand Commun Diviseur de a et b
                   c'est-à-dire le plus grand nombre qui divise a ET b.

   Exemple :  pgcd(8, 6) = 2   car 2 divise 8 et divise 6,
                               et aucun nombre plus grand ne fait ça.

   C'est LE nombre qui sert à simplifier une fraction : 8/6 se simplifie
   par 2 et devient 4/3.

   La méthode s'appelle l'algorithme d'Euclide, et elle est très maligne :
   le PGCD de a et b est le même que le PGCD de b et du reste de a ÷ b.
   On recommence jusqu'à ce que le reste soit 0 : la réponse est le
   dernier nombre trouvé. En JavaScript, "a % b" veut dire "le reste de
   la division de a par b".

     pgcd(8, 6) -> reste de 8÷6 = 2 -> pgcd(6, 2)
     pgcd(6, 2) -> reste de 6÷2 = 0 -> pgcd(2, 0)
     pgcd(2, 0) -> b vaut 0, donc la réponse est 2.
   ----------------------------------------------------------------------- */
function pgcd(a, b) {
  if (b === 0) {
    return a;
  }
  return pgcd(b, a % b); // la fonction s'appelle elle-même : c'est permis !
}


/* -----------------------------------------------------------------------
   ppcm(a, b)  ->  le Plus Petit Commun Multiple de a et b
                   c'est-à-dire le plus petit nombre présent à la fois
                   dans la table de a et dans la table de b.

   Exemple :  ppcm(4, 6) = 12   (table de 4 : 4, 8, 12...  table de 6 : 6, 12...)

   C'est le dénominateur commun que l'on cherche pour additionner
   deux fractions : 1/4 + 1/6 devient 3/12 + 2/12.

   L'astuce : a × b est toujours un multiple commun, mais souvent trop
   grand. On le divise par le PGCD pour obtenir le PLUS PETIT.
   ----------------------------------------------------------------------- */
function ppcm(a, b) {
  return (a / pgcd(a, b)) * b;
}
