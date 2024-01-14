import * as admin from 'firebase-admin';
import axios from 'axios';

export const firebaseMessaging = () => {
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

const searchForExpiredTokens = async () => {
  // https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
  try {
    // Vérifier 1 fois par semaine les token expirés
    const response = await axios.get('getAllTokenByTimestamp');
  } catch (error) {}
};

const callIntervalKp = async () => {
  try {
    const response = await axios.get('URL_DE_L_API_TIERCE');
    // Traitement de la réponse
    console.log("Réponse de l'API tierce :", response.data);
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API tierce :", error.message);
  }
};

// Create new server or add a function to actual server
// who listening to KP or XYZ periodically
// If condition matched, use SDK FCM and nestjs Routes
