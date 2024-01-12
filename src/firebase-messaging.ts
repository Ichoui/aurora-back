import * as admin from 'firebase-admin';
import axios from 'axios';

export const firebaseMessaging = () => {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  console.log('foot');
  // https://firebase.google.com/docs/admin/setup?hl=fr#initialize_the_sdk_in_non-google_environments
  // TODO Attention, il y a une commande pour créer une variable d'environnement
  // Ne jamais push ces clefs sur git --> documenter ca quelque part
  //TODO  Gérer le changement de prod à dév (script npm?)


    // setInterval(callIntervalKp, 3600000)
    // setInterval(searchForExpiredTokens, 60*24)
};


const searchForExpiredTokens = async () => {
    // https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=fr
    try {
        // Vérifier 1 fois par semaine les token expirés
        const response = await axios.get('getAllTokenByTimestamp')
    } catch (error) {

    }
}

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
