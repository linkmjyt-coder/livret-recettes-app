import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, deleteDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

const RECIPES_COLLECTION = "recipes";

export async function getAllRecipes() {
  const q = query(collection(db, RECIPES_COLLECTION), orderBy("created_date", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getRecipeById(id) {
  const ref = doc(db, RECIPES_COLLECTION, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function addRecipe(recipeData) {
  const user = auth.currentUser;
  const newRecipe = {
    ...recipeData,
    created_date: new Date().toISOString(),
    addedBy: {
      uid: user?.uid || null,
      name: user?.displayName || user?.email || "Inconnu",
    },
  };
  const docRef = await addDoc(collection(db, RECIPES_COLLECTION), newRecipe);
  return { id: docRef.id, ...newRecipe };
}
export async function deleteRecipe(id) {
  await deleteDoc(doc(db, "recipes", id));
}