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

## Les trois types d'exercices

| Bouton | Exemple | Ce qu'on apprend |
| --- | --- | --- |
| Simplifier | 8/6 → 4/3 | trouver le facteur commun |
| Somme / différence | 1/4 + 2/3 | mettre au même dénominateur |
| Multiplication | 2/3 × 4/5 | multiplier les hauts et les bas |

Trois niveaux : **Facile** (dénominateurs identiques), **Moyen** (un
dénominateur dans la table de l'autre), **Costaud** (dénominateurs
quelconques).

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

js/1-outils.js          les maths de base : pgcd, ppcm, hasard
js/2-affichage.js       comment dessiner une fraction sur deux lignes
js/3-exercices.js       la fabrique des trois types d'exercices
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
déjà installé l'appli.

## La règle importante pour les couleurs

L'application est faite pour être lisible quand on est daltonien. La
règle tenue partout dans le code :

> **La couleur n'est jamais la seule information.**

Ce qui est important est *aussi* en gras, souligné en pointillés, sur un
fond pâle ou entouré d'un cadre. Les couleurs viennent de la palette
« Okabe-Ito », conçue pour rester distinguables. Si tu ajoutes quelque
chose, garde cette règle.

## Envie de bricoler le code ?

Quelques idées faciles pour commencer :

- changer le bleu de mise en évidence dans `css/1-couleurs.css` ;
- rendre le niveau « Costaud » plus dur : dans `js/3-exercices.js`,
  augmenter `denominateurMax` ;
- écrire une nouvelle phrase d'explication dans `js/3-exercices.js`.
