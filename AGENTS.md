# Consignes du dépôt

## Projet associé

Ce dépôt est l'API NestJS/Firebase de l'application mobile située dans `../aurora-front` (chemin local habituel : `/Users/ichoui/Dev/aurora-front`). Le frontend Ionic/Angular utilise cette API pour Android ; une version Apple est prévue et doit pouvoir utiliser le même contrat HTTP.

Codex peut lire les deux dépôts pour comprendre un flux complet, vérifier l'utilisation réelle d'une route ou d'un champ, et mesurer l'impact d'un changement de contrat. Chercher notamment dans `../aurora-front/src/app/`, `../aurora-front/src/environments/` et dans les modèles du client quand la tâche concerne l'API. Ne modifier le dépôt voisin que si la demande porte aussi sur ce dépôt ou si la modification est nécessaire à la tâche demandée ; expliquer alors le changement.

Le contrat côté serveur est décrit dans `docs/api-contract.md` et `docs/openapi.json`. En cas d'écart avec le client, examiner les deux implémentations avant de décider laquelle adapter. Préserver la compatibilité des clients existants et éviter toute hypothèse propre à Android dans l'API partagée.

Respecter les préférences personnelles de l'utilisateur : communiquer en français ; aucun test, lint, contrôle ou opération Git sans demande explicite.
