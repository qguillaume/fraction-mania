# Fraction Mania

Un entraîneur de fractions : la carte affiche un calcul, et **chaque clic
révèle une étape** du raisonnement.

Pour lancer l'application : **double-clic sur `index.html`**. Rien à
installer, ça marche même sans internet.

## Les trois types d'exercices

| Bouton | Exemple | Ce qu'on apprend |
| --- | --- | --- |
| Simplifier | 8/6 → 4/3 | trouver le facteur commun |
| Somme / différence | 1/4 + 2/3 | mettre au même dénominateur |
| Multiplication | 2/3 × 4/5 | multiplier les hauts et les bas |

Trois niveaux : **Facile** (dénominateurs identiques), **Moyen** (un
dénominateur dans la table de l'autre), **Costaud** (dénominateurs
quelconques).

## Où est rangé quoi ?

```
index.html              le squelette de la page
css/1-couleurs.css      TOUTES les couleurs (le seul fichier à modifier
                        pour changer les couleurs)
css/2-mise-en-page.css  les tailles, les positions, les formes
js/1-outils.js          les maths de base : pgcd, ppcm, hasard
js/2-affichage.js       comment dessiner une fraction sur deux lignes
js/3-exercices.js       la fabrique des trois types d'exercices
js/4-application.js     le chef d'orchestre : clics, clavier, boutons
```

Les fichiers sont **numérotés dans l'ordre où le navigateur les charge** :
le 2 se sert du 1, le 3 se sert du 2, et ainsi de suite.

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
