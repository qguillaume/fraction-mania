# Fraction Mania

Un entraîneur de fractions : la carte affiche un calcul, et **chaque clic
révèle une étape** du raisonnement.

**En ligne :** https://qguillaume.github.io/fraction-mania/

Sur ordinateur, on peut aussi faire un **double-clic sur `index.html`** :
tout fonctionne sans internet et sans rien installer.

## Se tromper n'est pas grave

Sous la carte, deux boutons rattrapent une tape malheureuse :

- **◂ Étape précédente** : revient d'un cran dans le calcul en cours ;
- **◂◂ Fraction précédente** : revient à la fraction d'avant, exactement
  là où on l'avait laissée. Les **20 dernières** fractions sont gardées
  en mémoire.

Un bouton grisé veut dire qu'il n'y a plus rien derrière. Sur ordinateur,
la touche <kbd>←</kbd> fait la même chose que « Étape précédente ».

## La demi-droite graduée

À la **dernière étape**, quand le résultat ne peut plus être simplifié,
une demi-droite graduée apparaît sous le calcul et y place le nombre
trouvé :

- l'unité est découpée en autant de parts que le dénominateur (pour 3/4,
  quatre parts), donc on peut **compter les parts** jusqu'au repère ;
- une graduation plus grande marque chaque **demi**, avec « 1/2 » écrit
  sous la première : c'est le point d'appui du milieu, celui qui répond
  à « est-ce plus grand ou plus petit qu'un demi ? » ;
- le trajet depuis 0 est tracé en orange vif et en épais : on voit la
  **quantité**, pas seulement la position ;
- une phrase donne l'**encadrement** : « 3/4 est entre 0 et 1 ».

Les graduations se distinguent par leur **taille**, jamais par leur
couleur : entiers (les plus grandes), demis (intermédiaires), parts de
la fraction (les plus fines).

Elle ne s'affiche qu'à la fin, et disparaît si on revient en arrière.
Quand le dénominateur est trop grand (au-delà de 30 parts à dessiner),
les petites graduations sont omises : ça deviendrait illisible.

## Les sept types d'exercices

**Calculer** — la technique :

| Bouton | Exemple | Ce qu'on apprend |
| --- | --- | --- |
| Simplifier | 8/6 → 4/3 | trouver le facteur commun |
| Somme / différence | 1/4 + 2/3 | mettre au même dénominateur |
| Multiplication | 2/3 × 4/5 | multiplier les hauts et les bas |

**Comprendre** — le sens de la fraction, qui pèse le plus lourd en 6e :

| Bouton | Exemple | Ce qu'on apprend |
| --- | --- | --- |
| Quantité | les 3/4 de 20 € | partager, puis prendre — sur un vrai énoncé |
| Comparer | 1/3 ou 2/5 ? | comparer des parts de même taille |
| Encadrer | 7/4 = 1 + 3/4 | donner du sens aux fractions plus grandes que 1 |
| Décimal et % | 3/4 = 0,75 = 75 % | le pont avec le reste du programme |

**Quantité** tire une petite histoire au hasard (Paul et ses euros, une
classe d'élèves, un sac de billes, un trajet en km...) : c'est le format
« problème » qui bloque souvent, même quand la technique est acquise.

**Comparer** propose une fois sur quatre la comparaison à **1/2**, le
point de repère qui revient le plus souvent en contrôle.

Trois niveaux : **Facile** (dénominateurs identiques), **Moyen** (un
dénominateur dans la table de l'autre), **Costaud** (dénominateurs
quelconques). **Mélange** pioche dans les sept types.

## Installer l'appli sur le téléphone

L'application est une **PWA** : une page web qui s'installe comme une
vraie appli, avec son icône sur l'écran d'accueil, en plein écran, et
qui marche **sans connexion** une fois installée.

- **Android (Chrome)** : ouvrir le lien, puis toucher le bouton vert
  « ⬇ Installer l'appli ». (Il n'apparaît que si le téléphone propose
  l'installation.) Sinon : menu ⋮ → « Installer l'application ».
- **iPhone (Safari)** : ouvrir le lien, toucher le bouton Partager,
  puis « Sur l'écran d'accueil ». Safari ne montre jamais de bouton
  d'installation : c'est normal, il faut passer par là.

## Où est rangé quoi ?

```
index.html              le squelette de la page
manifest.webmanifest    la carte d'identité de l'appli (nom, icônes, couleurs)
sw.js                   le "service worker" : la copie hors ligne
icones/                 les icônes de l'appli

css/1-couleurs.css      TOUTES les couleurs (le seul fichier à modifier
                        pour changer les couleurs)
css/2-mise-en-page.css  les tailles, les positions, les formes

js/1-outils.js          les maths de base : pgcd, ppcm, hasard, décimales
js/2-affichage.js       comment dessiner une fraction sur deux lignes,
                        et la demi-droite graduée du résultat final
js/3-exercices.js       la fabrique des sept types d'exercices
js/4-application.js     le chef d'orchestre : clics, clavier, boutons
js/5-installation.js    l'installation sur le téléphone
```

Les fichiers sont **numérotés dans l'ordre où le navigateur les charge** :
le 2 se sert du 1, le 3 se sert du 2, et ainsi de suite.

## ⚠️ Après avoir modifié un fichier

Les téléphones gardent une copie de l'appli pour marcher hors ligne. Si
on modifie quelque chose, il faut leur dire que la copie est périmée :

**ouvrir `sw.js` et monter le numéro de version** (`fraction-mania-v1`
devient `fraction-mania-v2`).

Sans ça, l'ancienne version reste affichée sur les appareils qui ont
déjà installé l'appli — et on peut même se retrouver avec un mélange :
la nouvelle page, mais l'ancien code derrière.

Une fois le numéro monté, la mise à jour s'applique **toute seule** au
lancement suivant : `js/5-installation.js` détecte le changement et
recharge la page une fois, pour que tout vienne de la même version.

### Si un appareil semble bloqué sur une vieille version

C'est qu'il n'a pas encore vu le nouveau numéro. Dans l'ordre :

1. fermer complètement l'appli (pas juste la réduire) et la rouvrir ;
2. sur ordinateur : <kbd>Ctrl</kbd>+<kbd>Maj</kbd>+<kbd>R</kbd> ;
3. en dernier recours, Android : appui long sur l'icône → Infos sur
   l'appli → Stockage → Effacer les données.

## La règle importante pour les couleurs

L'application est faite pour être lisible quand on est daltonien. La
règle tenue partout dans le code :

> **La couleur n'est jamais la seule information.**

Ce qui est important est *aussi* en gras, souligné en pointillés, sur un
fond pâle ou entouré d'un cadre. Les couleurs viennent de la palette
« Okabe-Ito », conçue pour rester distinguables. Si tu ajoutes quelque
chose, garde cette règle.

### Toute l'application est orange

Le vert est le réflexe habituel pour dire « c'est bon ». Mais c'est
justement la teinte la plus risquée pour la forme la plus courante de
daltonisme, le rouge-vert : sur fond sombre, un vert-turquoise se
confond avec du gris, et le sens est perdu. L'orange reste franchement
visible.

Dans `css/1-couleurs.css`, trois teintes suffisent :

| Variable | À quoi ça sert |
| --- | --- |
| `--orange` | tout ce qui compte : titre, boutons, résultat, repère |
| `--orange-doux` | ce qui reste en retrait : la droite et ses graduations |
| `--fond-orange` | le fond pâle derrière un élément orange |

`--reussite` est un simple **nom de rôle** qui pointe vers `--orange` :
la bordure de la carte terminée, le résultat en gros et le repère de la
demi-droite s'en servent tous les trois.

**Le bleu ne subsiste qu'à un seul endroit** : les points de progression
en bas de la carte. C'est voulu — ils ne disent pas « c'est important »,
ils disent « tu en es là ». Un rôle à part mérite une couleur à part, et
le bleu ne pose aucun problème de daltonisme rouge-vert.

## Envie de bricoler le code ?

Quelques idées faciles pour commencer :

- changer la teinte de toute l'appli : une seule ligne, `--orange` dans
  `css/1-couleurs.css` ;
- rendre le niveau « Costaud » plus dur : dans `js/3-exercices.js`,
  augmenter `denominateurMax` ;
- écrire une nouvelle phrase d'explication, ou ajouter une histoire à la
  liste `HISTOIRES`, dans `js/3-exercices.js` ;
- **ajouter un type d'exercice** : écrire une fonction
  `genererMachin(niveau)`, l'ajouter à la liste `FABRIQUES` en bas de
  `js/3-exercices.js`, et poser un bouton `data-mode="machin"` dans
  `index.html`. Le mode « Mélange » le prendra en compte tout seul ;
- afficher la demi-droite plus tôt : il suffit d'ajouter un
  `valeur: { haut: ..., bas: ... }` à n'importe quelle étape de
  `js/3-exercices.js`.
