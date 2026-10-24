import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToSupabase } from "../utils/uploadImage";

const CATEGORIES = [
  { label: "Sélectionner", value: "" },
  { label: "Entrée", value: "entrée" },
  { label: "Préparation", value: "préparation" },
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

export default function ManualRecipeForm({ onSubmit, isSubmitting, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prep_time: "",
    cook_time: "",
    servings: "",
    category: "",
    difficulty: "moyenne",
    image_url: "",
    ingredients: [{ name: "", quantity: "" }],
    instructions: [""],
    tips: "",
  });

  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // INGREDIENTS
  const handleIngredientChange = (i, field, value) => {
    const newArr = [...formData.ingredients];
    newArr[i][field] = value;
    setFormData((p) => ({ ...p, ingredients: newArr }));
  };
  const addIngredient = () =>
    setFormData((p) => ({ ...p, ingredients: [...p.ingredients, { name: "", quantity: "" }] }));
  const removeIngredient = (i) =>
    setFormData((p) => ({ ...p, ingredients: p.ingredients.filter((_, idx) => idx !== i) }));

  // INSTRUCTIONS
  const handleInstructionChange = (i, value) => {
    const newArr = [...formData.instructions];
    newArr[i] = value;
    setFormData((p) => ({ ...p, instructions: newArr }));
  };
  const addInstruction = () =>
    setFormData((p) => ({ ...p, instructions: [...p.instructions, ""] }));
  const removeInstruction = (i) =>
    setFormData((p) => ({ ...p, instructions: p.instructions.filter((_, idx) => idx !== i) }));

  // IMAGE PICKER
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
      handleChange("image_url", "");
    }
  };

  const removeImage = () => {
    setImageUri(null);
    handleChange("image_url", "");
  };

  // UPLOAD IMAGE SUPABASE
 const uploadImage = async () => {
   if (!imageUri) return formData.image_url || null;
   setUploading(true);
   try {
     return await uploadImageToSupabase(imageUri);
   } finally {
     setUploading(false);
   }
 };

  // SUBMIT
  const handleSubmit = async () => {
    if (!formData.title) {
      Alert.alert("Erreur", "Le titre est obligatoire !");
      return;
    }
    const finalImageUrl = await uploadImage();
    const cleaned = {
      ...formData,
      prep_time: Number(formData.prep_time) || 0,
      cook_time: Number(formData.cook_time) || 0,
      servings: Number(formData.servings) || 0,
      image_url: finalImageUrl || null,
      ingredients: formData.ingredients.filter((i) => i.name && i.quantity),
      instructions: formData.instructions.filter((s) => s.trim().length > 0),
    };
    await onSubmit(cleaned);
  };

  return (
    <View style={styles.container}>

      {/* TITRE */}
      <Text style={styles.label}>Titre </Text>
      <TextInput
        style={styles.input}
        placeholder="Nom de la recette"
        value={formData.title}
        onChangeText={(v) => handleChange("title", v)}
      />

      {/* DESCRIPTION */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Décris ta recette..."
        value={formData.description}
        onChangeText={(v) => handleChange("description", v)}
        multiline
        numberOfLines={3}
      />

      {/* IMAGE */}
      <Text style={styles.label}>Image</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>📷 Choisir une image</Text>
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { marginTop: 8 }]}
        placeholder="Ou colle une URL d'image"
        value={formData.image_url}
        onChangeText={(v) => {
          handleChange("image_url", v);
          setImageUri(null);
        }}
      />

      {(imageUri || formData.image_url) && (
        <View style={{ marginTop: 8 }}>
          <Image
            source={{ uri: imageUri || formData.image_url }}
            style={styles.preview}
          />
          <TouchableOpacity style={styles.removeImageBtn} onPress={removeImage}>
            <Text style={styles.removeImageText}>🗑 Supprimer l'image</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TEMPS + PORTIONS */}
      <View style={styles.row}>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Préparation (min)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.prep_time}
            onChangeText={(v) => handleChange("prep_time", v)}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Cuisson (min)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.cook_time}
            onChangeText={(v) => handleChange("cook_time", v)}
          />
        </View>
        <View style={styles.rowItem}>
          <Text style={styles.label}>Portions</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.servings}
            onChangeText={(v) => handleChange("servings", v)}
          />
        </View>
      </View>

      {/* CATEGORIE */}
      <Text style={styles.label}>Catégorie</Text>
      <View style={styles.optionsRow}>
        {CATEGORIES.filter((c) => c.value).map((cat) => (
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

      {/* DIFFICULTE */}
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

      {/* INGREDIENTS */}
      <Text style={styles.sectionTitle}>Ingrédients</Text>
      {formData.ingredients.map((ing, i) => (
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

      {/* INSTRUCTIONS */}
      <Text style={styles.sectionTitle}>Étapes</Text>
      {formData.instructions.map((step, i) => (
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

      {/* TIPS */}
      <Text style={styles.label}>Conseils / Astuces</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Des conseils pour réussir la recette..."
        value={formData.tips}
        onChangeText={(v) => handleChange("tips", v)}
        multiline
        numberOfLines={3}
      />

      {/* BOUTONS */}
      <View style={styles.actions}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.submitBtn, (isSubmitting || uploading) && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isSubmitting || uploading}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting || uploading ? "Enregistrement..." : "Enregistrer"}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 4 },
  label: { fontWeight: "600", fontSize: 14, color: "#292524", marginBottom: 4, marginTop: 12 },
  sectionTitle: { fontWeight: "700", fontSize: 17, color: "#292524", marginTop: 16, marginBottom: 8 },
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
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  rowItem: { flex: 1 },
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
  ingredientRow: { flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" },
  removeBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  removeBtnText: { color: "white", fontSize: 20, fontWeight: "bold" },
  addBtn: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 4,
  },
  addBtnText: { color: "#6b7280", fontWeight: "500" },
  imageButton: {
    backgroundColor: "#f97316",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  imageButtonText: { color: "white", fontWeight: "600" },
  preview: { width: "100%", height: 180, borderRadius: 10, resizeMode: "cover" },
  removeImageBtn: {
    marginTop: 8,
    backgroundColor: "#ef4444",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  removeImageText: { color: "white", fontWeight: "500" },
  actions: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 32 },
  cancelBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelBtnText: { color: "#6b7280", fontWeight: "600" },
  submitBtn: {
    flex: 1,
    backgroundColor: "#f97316",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontWeight: "700", fontSize: 15 },
});