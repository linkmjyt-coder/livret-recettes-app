import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase";

// Configuration de l'affichage des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Enregistrer le token de l'appareil
export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.error("NOTIF: Pas un vrai appareil !");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  console.error("NOTIF: Permission actuelle:", existingStatus);

  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
    console.error("NOTIF: Nouvelle permission:", finalStatus);
  }

  if (finalStatus !== "granted") {
    console.error("NOTIF: Permission refusée !");
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: "a270a0af-636f-4f8f-8e36-fca424ec9943",
    });
    const token = tokenData.data;
    console.error("NOTIF: Token obtenu:", token);

    const user = auth.currentUser;
    if (user && token) {
      await setDoc(doc(db, "pushTokens", user.uid), {
        token,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      });
      console.error("NOTIF: Token sauvegardé dans Firebase !");
    } else {
      console.error("NOTIF: Pas d'utilisateur connecté ou token vide");
    }

    return token;
  } catch (err) {
    console.error("NOTIF: Erreur lors de la récupération du token:", err);
    return null;
  }
}

// Envoyer une notification à tous les utilisateurs
export async function sendRecipeNotification(recipeTitle) {
  try {
    const snapshot = await getDocs(collection(db, "pushTokens"));
    const tokens = snapshot.docs.map((d) => d.data().token).filter(Boolean);
    console.error("NOTIF: Envoi à", tokens.length, "appareils");

    if (tokens.length === 0) {
      console.error("NOTIF: Aucun token trouvé !");
      return;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        tokens.map((token) => ({
          to: token,
          title: "🍳 Une recette a été ajoutée !",
          body: recipeTitle,
          sound: "default",
        }))
      ),
    });

    const result = await response.json();
    console.error("NOTIF: Résultat envoi:", JSON.stringify(result));
  } catch (err) {
    console.error("NOTIF: Erreur envoi notification:", err);
  }
}