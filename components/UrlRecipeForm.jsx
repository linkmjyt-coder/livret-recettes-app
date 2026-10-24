import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToSupabase } from "../utils/uploadImage";

const CATEGORIES = [
  { label: "Entrée", value: "entrée" },
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

export default function UrlRecipeForm({ onSubmit, isSubmitting }) {
  const [recipe, setRecipe] = useState({
    url: "",
    title: "",
    description: "",
    image_url: "",
    category: "",
    difficulty: "moyenne",
  });

  const [imageMode, setImageMode] = useState("file");
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const updateField = (field, value) => {
    setRecipe((prev) => ({ ...prev, [field]: value }));
  };

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
      updateField("image_url", "");
    }
  };

const uploadImage = async () => {
  if (!imageUri) return formData.image_url || null;
  setUploading(true);
  try {
    return await uploadImageToSupabase(imageUri);
  } finally {
    setUploading(false);
  }
};

  const handleSubmit = async () => {
    if (!recipe.url) {
      Alert.alert("Erreur", "Le lien de la recette est obligatoire !");
      return;
    }
    const finalImageUrl = await uploadImage();
    await onSubmit({ ...recipe, image_url: finalImageUrl || null });
  };

  const previewUri = imageUri || recipe.image_url || null;

  return (
    <View style={styles.container}>

      {/* URL */}
      <Text style={styles.label}>Lien de la recette *</Text>
      <TextInput
        style={styles.input}
        placeholder="https://exemple.com/recette"
        value={recipe.url}
        onChangeText={(v) => updateField("url", v)}
        keyboardType="url"
        autoCapitalize="none"
      />

      {/* TITRE */}
      <Text style={styles.label}>Nom de la recette</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex : Tarte aux pommes"
        value={recipe.title}
        onChangeText={(v) => updateField("title", v)}
      />

      {/* DESCRIPTION */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Décris ta recette..."
        value={recipe.description}
        onChangeText={(v) => updateField("description", v)}
        multiline
        numberOfLines={3}
      />

      {/* CATEGORIE */}
      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.optionsRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.optionBtn, recipe.category === cat.value && styles.optionBtnActive]}
            onPress={() => updateField("category", cat.value)}
          >
            <Text style={[styles.optionText, recipe.category === cat.value && styles.optionTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* DIFFICULTE */}
      <Text style={styles.label}>Difficulté</Text>
      <View style={styles.optionsRow}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d.value}
            style={[styles.optionBtn, recipe.difficulty === d.value && styles.optionBtnActive]}
            onPress={() => updateField("difficulty", d.value)}
          >
            <Text style={[styles.optionText, recipe.difficulty === d.value && styles.optionTextActive]}>
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* IMAGE */}
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
          placeholder="https://exemple.com/image.jpg"
          value={recipe.image_url}
          onChangeText={(v) => {
            updateField("image_url", v);
            setImageUri(null);
          }}
          keyboardType="url"
          autoCapitalize="none"
        />
      )}

      {previewUri && (
        <Image
          source={{ uri: previewUri }}
          style={styles.preview}
        />
      )}

      {/* ENREGISTRER */}
      <TouchableOpacity
        style={[styles.submitBtn, (isSubmitting || uploading || !recipe.url) && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={isSubmitting || uploading || !recipe.url}
      >
        <Text style={styles.submitBtnText}>
          {isSubmitting || uploading ? "Enregistrement..." : "Enregistrer la recette"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  label: { fontWeight: "600", fontSize: 14, color: "#292524", marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    backgroundColor: "white",
    color: "#292524",
  },
  textarea: { minHeight: 70, textAlignVertical: "top" },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  optionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  optionBtnActive: { backgroundColor: "#f97316", borderColor: "#f97316" },
  optionText: { fontSize: 13, color: "#6b7280" },
  optionTextActive: { color: "white", fontWeight: "600" },
  imageTabs: { flexDirection: "row", gap: 8, marginBottom: 8 },
  imageTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    backgroundColor: "white",
  },
  imageTabActive: { backgroundColor: "#f97316", borderColor: "#f97316" },
  imageTabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  imageTabTextActive: { color: "white", fontWeight: "600" },
  imageButton: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  imageButtonText: { color: "white", fontWeight: "600" },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    resizeMode: "cover",
    marginTop: 8,
  },
  submitBtn: {
    backgroundColor: "#f97316",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
  },
  submitBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});