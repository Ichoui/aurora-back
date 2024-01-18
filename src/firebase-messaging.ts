import * as admin from 'firebase-admin';
import axios from 'axios';

export const firebaseMessaging = () => {
  // TODO si il n'y a que ça, on repasse dans le main.ts avec du commentaire, thx
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  // https://firebase.google.com/docs/admin/setup?hl=fr#initialize_the_sdk_in_non-google_environments
    // Il faudra vérifier que ceci fonctionne correctement, je n'en suis pas convaincu pour l'instant. Peut être il faudra push avant même d'envoyer les notifs, seulement avec ça.
  // $env:GOOGLE_APPLICATION_CREDENTIALS=C:\development\aurora-back\environments\aurora-sdk.prod.json
  // ou
  // set GOOGLE_APPLICATION_CREDENTIALS=C:\development\aurora-back\environments\aurora-sdk.prod.json

  // TODO Attention, il y a une commande pour créer une variable d'environnement <-- IL FAUT SCRIPTER CA !!!!
  //TODO  Gérer le changement de prod à dév (script npm?)

  // https://firebase.google.com/docs/functions/schedule-functions?hl=fr&gen=2nd$
  // ou node-cron
  // voir si quand la fonction s'éteint, ça trigger quand même.... :grimace:
  // Faudra peut être jouer un script bidon sur le serveur OVH autrement ... :o

  // Va faloir faire un CRON sur le serveur OVH en effet.. qui va faire un appel vers les routes en dessous
  // setInterval(callIntervalKp, 3600000)
  // setInterval(searchForExpiredTokens, 60*24)
};
