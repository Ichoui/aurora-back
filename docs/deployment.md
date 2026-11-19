# Déployer l’API Aurora sur Firebase

## Cible et configuration

Le dépôt exporte une seule fonction HTTP Firebase v2 nommée `aurora`. Le code embarque le catalogue de villes et contacte NOAA et OpenWeather. Node.js 22 est configuré dans `firebase.json`. Utiliser la version de `.nvmrc`, `npm ci`, un compte Firebase autorisé, un projet avec facturation Blaze et une cible explicite. Réserver un projet différent à la qualification. [Gestion des fonctions](https://firebase.google.com/docs/functions/manage-functions)

Relever le projet, la région, la fonction et la révision en service. Confirmer l’URL de production avec le client actuel et les anciens binaires pour lesquels l’API reste supportée. La fonction et le préfixe Nest peuvent chacun ajouter `aurora` au chemin. Partir de l’URL de fonction fournie par Firebase puis ajouter `/aurora` pour le point d’entrée Nest, conformément au [contrat mobile](api-contract.md). Sur le client moderne, l’hôte de production pointe directement vers une URL `run.app`.

L’API relaie en priorité l’`appid` des clients historiques. Si le client omet ce paramètre, elle utilise la variable serveur `OPENWEATHER_API_KEY` lorsqu’elle est fournie. Qualifier le rattachement de cette variable au secret sur un projet de test, le quota et les deux formes de requête avant toute activation en production. Le client actuel continue à envoyer son propre `appid`. [Secrets Firebase](https://firebase.google.com/docs/functions/config-env)

## Qualification locale et staging

Après compilation, exécuter `node --test scripts/bootstrap-retry.test.cjs scripts/weather-compatibility.test.cjs` pour contrôler le 503 suivi d’une reprise et la priorité donnée à la clé historique.

1. Exécuter `npm run docs:check` et vérifier que `dist/src/main.js` et `dist/src/city/cities.json` existent. En cas d’écart OpenAPI, vérifier le contrat avant de régénérer le fichier.
2. Lancer `npm start` et vérifier depuis l’émulateur les routes villes, météo, nowcast et carte avec le header `aurora: true`. Tester les erreurs et le format historique contre le [contrat](api-contract.md) et le [plan de qualification](../../aurora-front/ia/back/01-firebase-et-contrat.md).
3. Déployer d’abord au projet de qualification, puis rejouer ces contrôles contre cette URL avec test Android. Préparer une révision ou un artefact source précédent pouvant être restauré. Relever le délai au premier appel et les erreurs récurrentes.

Le scénario reproductible reçoit l’URL complète de l’API jusqu’au préfixe Nest. L’option `--upstream` ajoute les routes NOAA et `--weather` ajoute les deux routes OpenWeather. Pour vérifier le format historique, fournir la clé de qualification par variable d’environnement `AURORA_SMOKE_WEATHER_KEY`. Après activation du secret serveur sur une cible de qualification, rejouer `--weather` sans cette variable pour contrôler les appels sans `appid`.

```sh
node scripts/check-http.cjs "$AURORA_FUNCTION_URL/aurora" --upstream
```

## Déploiement ciblé

Après confirmation du projet et de la release, lancer depuis ce dépôt sur la cible choisie.

```sh
./node_modules/.bin/firebase deploy --only functions:aurora --project PROJECT_ID
```

Le hook Firebase `predeploy` compile le code. La commande existante `npm run deploy` effectue également un build avant celui du hook et vise l’ensemble des fonctions. Pour les releases Aurora, la commande ci-dessus limite la portée à la fonction `aurora`.

Après le déploiement, vérifier la révision publiée et tester le point d’entrée et la recherche de ville sur l’URL attendue. Utiliser des données de test pour les autres vérifications et garder les paramètres météo sensibles hors des commandes enregistrées et des journaux.

```sh
curl --fail-with-body -H 'aurora: true' "$AURORA_FUNCTION_URL/aurora"
curl --fail-with-body -H 'aurora: true' "$AURORA_FUNCTION_URL/aurora/cities?search=tro"
```

Surveiller les démarrages, erreurs 5xx, latence, amplitude des appels NOAA/OpenWeather et coûts. Si l’API regresse, arrêter la diffusion du client et restaurer le trafic vers la révision précédente si la configuration le permet. À défaut, redéployer la source de la dernière version qualifiée dans le même projet et vérifier de nouveau l’URL et le contrat client.

Le [skill local Aurora Release](../../aurora-front/.agents/skills/aurora-release/SKILL.md) se trouve dans le dépôt front.
