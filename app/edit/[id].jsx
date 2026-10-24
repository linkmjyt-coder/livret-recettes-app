import { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Image, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft } from "lucide-react-native";
import { uploadImageToSupabase } from "../../utils/uploadImage";
import { deleteRecipe } from "../../services/recipesService";

const CATEGORIES = [
  { label: "Entrée", value: "entrée" },
  { label: "Préparation",value: "préparation" },
  { label: "Plat principal", value: "plat principal" },
  { label: "Dessert", value: "dessert" },
  { label: "Apéritif", value: "apéritif" },
  { label: "Boisson", value: "boisson" },
  { label: "Sauce", value: "sauce" },
  { label: "Accompagnement", value: "accompagnement" },
];

const DIFFICULTIES = [
  { label: "Facile", value: "facile" },
  { label: "Moyenne", value: "moyenne" },
  { label: "Difficile", value: "difficile" },
];

// ─────────────────────────────────────────
// Formulaire URL
// ─────────────────────────────────────────
function UrlForm({ formData, setFormData, onImageUriChange }) {
  const [imageMode, setImageMode] = useState("file");
  const [imageUri, setImageUri] = useState(null);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission refusée", "Autorise l'accès à la galerie.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      onImageUriChange(result.assets[0].uri);
      updateField("image_url", "");
    }
  };

  const previewUri = imageUri || formData.image_url || null;

  return (
    <View style={styles.formContainer}>

      <Text style={styles.label}>Lien de la recette</Text>
      <TextInput
        style={styles.input}
        value={formData.url}
        onChangeText={(v) => updateField("url", v)}
        placeholder="https://exemple.com/recette"
        keyboardType="url"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Nom de la recette</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(v) => updateField("title", v)}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={formData.description}
        onChangeText={(v) => updateField("description", v)}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.optionsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.optionBtn, formData.category === cat.value && styles.optionBtnActive]}
            onPress={() => updateField("category", cat.value)}
          >
            <Text style={[styles.optionText, formData.category === cat.value && styles.optionTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Difficulté</Text>
      <View style={styles.optionsRow}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.optionBtn, formData.difficulty === d.value && styles.optionBtnActive]}
            onPress={() => updateField("difficulty", d.value)}
          >
            <Text style={[styles.optionText, formData.difficulty === d.value && styles.optionTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Image</Text>
      <View style={styles.imageTabs}>
        <TouchableOpacity
          style={[styles.imageTab, imageMode === "file" && styles.imageTabActive]}
          onPress={() => setImageMode("file")}
        >
          <Text style={[styles.imageTabText, imageMode === "file" && styles.imageTabTextActive]}>
            Depuis mon appareil
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.imageTab, imageMode === "url" && styles.imageTabActive]}
          onPress={() => setImageMode("url")}
        >
          <Text style={[styles.imageTabText, imageMode === "url" && styles.imageTabTextActive]}>
            Depuis un lien
          </Text>
        </TouchableOpacity>
      </View>

      {imageMode === "file" ? (
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>📷 Choisir une image</Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.input}
          value={formData.image_url}
          onChangeText={(v) => updateField("image_url", v)}
          placeholder="https://exemple.com/image.jpg"
          keyboardType="url"
          autoCapitalize="none"
        />
      )}

      {previewUri && (
        <Image source={{ uri: previewUri }} style={styles.preview} />
      )}

    </View>
  );
}

// ─────────────────────────────────────────
// Formulaire Manuel
// ─────────────────────────────────────────
function ManualForm({ formData, setFormData, onImageUriChange }) {
  const [imageUri, setImageUri] = useState(null);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleIngredientChange = (i, field, value) => {
    const newArr = [...formData.ingredients];
    newArr[i][field] = value;
    setFormData((p) => ({ ...p, ingredients: newArr }));
  };

  const addIngredient = () =>
    setFormData((p) => ({ ...p, ingredients: [...p.ingredients, { name: "", quantity: "" }] }));

  const removeIngredient = (i) =>
    setFormData((p) => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }));

  const handleInstructionChange = (i, value) => {
    const newArr = [...formData.instructions];
    newArr[i] = value;
    setFormData((p) => ({ ...p, instructions: newArr }));
  };

  const addInstruction = () =>
    setFormData((p) => ({ ...p, instructions: [...p.instructions, ""] }));

  const removeInstruction = (i) =>
    setFormData((p) => ({ ...p, instructions: p.instructions.filter((_, idx) => idx !== i) }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      onImageUriChange(result.assets[0].uri);
      handleChange("image_url", "");
    }
  };

  return (
    <View style={styles.formContainer}>

      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(v) => handleChange("title", v)}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={formData.description}
        onChangeText={(v) => handleChange("description", v)}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Image</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 Choisir une image</Text>
      </TouchableOpacity>
      <TextInput
        style={[styles.input, { marginTop: 8 }]}
        placeholder="Ou URL d'une image"
        value={formData.image_url}
        onChangeText={(v) => {
          handleChange("image_url", v);
          setImageUri(null);
          onImageUriChange(null);
        }}
      />
      {(imageUri || formData.image_url) && (
        <View>
          <Image source={{ uri: imageUri || formData.image_url }} style={styles.preview} />
          <TouchableOpacity
            style={styles.removeImageBtn}
            onPress={() => {
              setImageUri(null);
              onImageUriChange(null);
              handleChange("image_url", "");
            }}
          >
            <Text style={styles.removeImageText}>🗑 Supprimer l'image</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Préparation (min)</Text>
          <TextInput
            style={styles.input}
            value={String(formData.prep_time || "")}
            onChangeText={(v) => handleChange("prep_time", v)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Cuisson (min)</Text>
          <TextInput
            style={styles.input}
            value={String(formData.cook_time || "")}
            onChangeText={(v) => handleChange("cook_time", v)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Portions</Text>
          <TextInput
            style={styles.input}
            value={String(formData.servings || "")}
            onChangeText={(v) => handleChange("servings", v)}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.optionsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.optionBtn, formData.category === cat.value && styles.optionBtnActive]}
            onPress={() => handleChange("category", cat.value)}
          >
            <Text style={[styles.optionText, formData.category === cat.value && styles.optionTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Difficulté</Text>
      <View style={styles.optionsRow}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.optionBtn, formData.difficulty === d.value && styles.optionBtnActive]}
            onPress={() => handleChange("difficulty", d.value)}
          >
            <Text style={[styles.optionText, formData.difficulty === d.value && styles.optionTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Ingrédients</Text>
      {formData.ingredients?.map((ing, i) => (
        <View key={i} style={styles.ingredientRow}>
          <TextInput
            style={[styles.input, { width: 90 }]}
            placeholder="Quantité"
            value={ing.quantity}
            onChangeText={(v) => handleIngredientChange(i, "quantity", v)}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Nom"
            value={ing.name}
            onChangeText={(v) => handleIngredientChange(i, "name", v)}
          />
          {formData.ingredients.length > 1 && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeIngredient(i)}>
              <Text style={styles.removeBtnText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
        <Text style={styles.addBtnText}>+ Ajouter un ingrédient</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Étapes</Text>
      {formData.instructions?.map((step, i) => (
        <View key={i} style={styles.ingredientRow}>
          <TextInput
            style={[styles.input, styles.textarea, { flex: 1 }]}
            placeholder={`Étape ${i + 1}`}
            value={step}
            onChangeText={(v) => handleInstructionChange(i, v)}
            multiline
            numberOfLines={2}
          />
          {formData.instructions.length > 1 && (
            <TouchableOpacity style={styles.removeBtn} onPress={() => removeInstruction(i)}>
              <Text style={styles.removeBtnText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn} onPress={addInstruction}>
        <Text style={styles.addBtnText}>+ Ajouter une étape</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Conseils / Astuces</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={formData.tips}
        onChangeText={(v) => handleChange("tips", v)}
        multiline
        numberOfLines={3}
      />

    </View>
  );
}

// ─────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────
export default function EditRecipe() {
  const { id: recipeId } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUrlRecipe, setIsUrlRecipe] = useState(false);
  const [formData, setFormData] = useState({});
  const [pendingImageUri, setPendingImageUri] = useState(null);

  useEffect(() => {
    async function loadRecipe() {
      const snap = await getDoc(doc(db, "recipes", recipeId));
      if (!snap.exists()) {
        Alert.alert("Erreur", "Recette introuvable.");
        router.push("/");
        return;
      }
      const data = snap.data();
      const hasUrl = !!(data.url && data.url.startsWith("http"));
      setIsUrlRecipe(hasUrl);
      if (hasUrl) {
        setFormData({
          url: data.url || "",
          title: data.title || "",
          description: data.description || "",
          image_url: data.image_url || "",
          category: data.category || "",
          difficulty: data.difficulty || "moyenne",
        });
      } else {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          prep_time: data.prep_time || "",
          cook_time: data.cook_time || "",
          servings: data.servings || "",
          category: data.category || "",
          difficulty: data.difficulty || "moyenne",
          image_url: data.image_url || "",
          ingredients: data.ingredients?.length ? data.ingredients : [{ name: "", quantity: "" }],
          instructions: data.instructions?.length ? data.instructions : [""],
          tips: data.tips || "",
        });
      }
      setLoading(false);
    }
    loadRecipe();
  }, [recipeId]);

  const handleDelete = async () => {
    Alert.alert(
      "Supprimer la recette",
      "Es-tu sûr de vouloir supprimer cette recette ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecipe(recipeId);
              router.push("/");
            } catch (err) {
              console.error(err);
              Alert.alert("Erreur", "Impossible de supprimer la recette.");
            }
          },
        },
      ]
    );
  };

  const saveRecipe = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formData.image_url;
      if (pendingImageUri) {
        finalImageUrl = await uploadImageToSupabase(pendingImageUri);
      }
      const cleaned = isUrlRecipe
        ? { ...formData, image_url: finalImageUrl, updatedAt: Date.now() }
        : {
            ...formData,
            image_url: finalImageUrl,
            prep_time: Number(formData.prep_time) || 0,
            cook_time: Number(formData.cook_time) || 0,
            servings: Number(formData.servings) || 0,
            ingredients: formData.ingredients?.filter((i) => i.name && i.quantity) || [],
            instructions: formData.instructions?.filter((s) => s.trim().length > 0) || [],
            updatedAt: Date.now(),
          };
      await updateDoc(doc(db, "recipes", recipeId), cleaned);
      Alert.alert("✅ Succès", "Recette mise à jour !", [
        { text: "OK", onPress: () => router.push(`/recipe/${recipeId}`) },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de sauvegarder.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#f97316" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Modifier la recette</Text>
      </View>

      {isUrlRecipe ? (
        <UrlForm formData={formData} setFormData={setFormData} onImageUriChange={setPendingImageUri} />
      ) : (
        <ManualForm formData={formData} setFormData={setFormData} onImageUriChange={setPendingImageUri} />
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelBtnText}>Annuler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.7 }]}
          onPress={saveRecipe}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Text style={styles.deleteBtnText}>🗑️ Supprimer la recette</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBF5" },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#fff7ed",
  },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  backText: { color: "#f97316", fontSize: 15, fontWeight: "500" },
  title: { fontSize: 26, fontWeight: "bold", color: "#292524" },
  formContainer: { padding: 16 },
  label: { fontWeight: "600", fontSize: 14, color: "#292524", marginBottom: 4, marginTop: 12 },
  sectionTitle: { fontWeight: "700", fontSize: 17, color: "#292524", marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 10, fontSize: 14, backgroundColor: "white", color: "#292524",
  },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  rowItem: { flex: 1 },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  optionBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "white",
  },
  optionBtnActive: { backgroundColor: "#f97316", borderColor: "#f97316" },
  optionText: { fontSize: 13, color: "#6b7280" },
  optionTextActive: { color: "white", fontWeight: "600" },
  ingredientRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" },
  removeBtn: {
    backgroundColor: "#ef4444", borderRadius: 8,
    width: 32, height: 32, alignItems: "center", justifyContent: "center",
  },
  removeBtnText: { color: "white", fontSize: 20, fontWeight: "bold" },
  addBtn: { backgroundColor: "#f3f4f6", padding: 10, borderRadius: 10, alignItems: "center", marginBottom: 4 },
  addBtnText: { color: "#6b7280", fontWeight: "500" },
  imageButton: { backgroundColor: "#f97316", padding: 12, borderRadius: 10, alignItems: "center" },
  imageButtonText: { color: "white", fontWeight: "600" },
  preview: { width: "100%", height: 180, borderRadius: 10, resizeMode: "cover", marginTop: 8 },
  removeImageBtn: { marginTop: 8, backgroundColor: "#ef4444", padding: 8, borderRadius: 8, alignItems: "center" },
  removeImageText: { color: "white", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12, padding: 16, marginBottom: 16 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center",
  },
  cancelBtnText: { color: "#6b7280", fontWeight: "600" },
  submitBtn: { flex: 1, backgroundColor: "#f97316", padding: 14, borderRadius: 10, alignItems: "center" },
  submitBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
  imageTabs: { flexDirection: "row", gap: 8, marginBottom: 8 },
  imageTab: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: "#e5e7eb", alignItems: "center", backgroundColor: "white",
  },
  imageTabActive: { backgroundColor: "#f97316", borderColor: "#f97316" },
  imageTabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  imageTabTextActive: { color: "white", fontWeight: "600" },
  deleteBtn: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    marginBottom: 32,
  },
  deleteBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});