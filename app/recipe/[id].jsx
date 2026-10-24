import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Clock, ChefHat, Users, ArrowLeft, ExternalLink } from "lucide-react-native";
import { getRecipeById } from "../../services/recipesService";
import { auth } from "../../firebase";

const categoryColors = {
  "entrée": { bg: "#dbeafe", text: "#1e40af" },
  "plat principal": { bg: "#ede9fe", text: "#6b21a8" },
  "préparation": { bg: "#ede9fe", text: "#6b21a8" },
  "dessert": { bg: "#fce7f3", text: "#9d174d" },
  "apéritif": { bg: "#fef3c7", text: "#92400e" },
  "boisson": { bg: "#cffafe", text: "#155e75" },
  "sauce": { bg: "#ffedd5", text: "#9a3412" },
  "accompagnement": { bg: "#ecfccb", text: "#3f6212" },
};

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecipeById(id)
      .then(setRecipe)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Recette introuvable</Text>
        <TouchableOpacity onPress={() => router.push("/")}>
          <Text style={styles.backLink}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const catColor = categoryColors[recipe.category] || { bg: "#f3f4f6", text: "#374151" };
  const isOwner = auth.currentUser?.uid === recipe.addedBy?.uid;

  return (
    <ScrollView style={styles.container}>

      {/* IMAGE */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: recipe.image_url ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
          }}
          style={styles.image}
        />

        {/* BOUTON RETOUR */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
          <ArrowLeft size={20} color="white" />
        </TouchableOpacity>

        {/* BADGE CATEGORIE */}
        {recipe.category && (
          <View style={[styles.badge, { backgroundColor: catColor.bg }]}>
            <Text style={[styles.badgeText, { color: catColor.text }]}>
              {recipe.category}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>

        {/* TITRE + DESCRIPTION */}
        <Text style={styles.title}>{recipe.title}</Text>

        {recipe.description ? (
          <Text style={styles.description}>{recipe.description}</Text>
        ) : null}

        {/* QUI A AJOUTÉ */}
        {isOwner && recipe.addedBy?.name ? (
          <Text style={styles.addedBy}>
            👤 Ajouté par : {recipe.addedBy.name}
          </Text>
        ) : null}

        {/* LIEN EXTERNE */}
        {recipe.url && recipe.url.startsWith("http") && (
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => Linking.openURL(recipe.url)}
          >
            <ExternalLink size={16} color="#f97316" />
            <Text style={styles.linkButtonText}>Voir la recette originale</Text>
          </TouchableOpacity>
        )}

        {/* INFOS */}
        <View style={styles.metaRow}>
          {recipe.prep_time ? (
            <View style={styles.metaCard}>
              <Clock size={20} color="#f97316" />
              <Text style={styles.metaValue}>{recipe.prep_time} min</Text>
              <Text style={styles.metaLabel}>Préparation</Text>
            </View>
          ) : null}
          {recipe.cook_time ? (
            <View style={styles.metaCard}>
              <ChefHat size={20} color="#f97316" />
              <Text style={styles.metaValue}>{recipe.cook_time} min</Text>
              <Text style={styles.metaLabel}>Cuisson</Text>
            </View>
          ) : null}
          {recipe.servings ? (
            <View style={styles.metaCard}>
              <Users size={20} color="#f97316" />
              <Text style={styles.metaValue}>{recipe.servings}</Text>
              <Text style={styles.metaLabel}>Personnes</Text>
            </View>
          ) : null}
        </View>

        {/* INGREDIENTS */}
        {recipe.ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛒 Ingrédients</Text>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.ingredientDot} />
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientQty}>{ing.quantity} </Text>
                  {ing.name}
                  {ing.optional && (
                    <Text style={styles.optional}> (facultatif)</Text>
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* INSTRUCTIONS */}
        {recipe.instructions?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
            {recipe.instructions.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        )}

        {/* TIPS */}
        {recipe.tips && (
          <View style={styles.tipsBox}>
            <Text style={styles.tipsText}>💡 <Text style={{ fontWeight: "700" }}>Astuce : </Text>{recipe.tips}</Text>
          </View>
        )}

        {/* FOOTER */}
        <TouchableOpacity style={styles.footerBack} onPress={() => router.push("/")}>
          <ArrowLeft size={16} color="#f97316" />
          <Text style={styles.footerBackText}>Retour aux recettes</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFBF5" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 18, color: "#6b7280", marginBottom: 12 },
  backLink: { color: "#f97316", fontWeight: "600" },
  imageContainer: { position: "relative", height: 280 },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  backButton: {
    position: "absolute",
    top: 48,
    left: 16,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
    padding: 8,
  },
  badge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  content: { padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#292524", marginBottom: 8 },
  description: { fontSize: 15, color: "#6b7280", marginBottom: 8, lineHeight: 22 },
  addedBy: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 16,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 10,
  },
  linkButtonText: { color: "#f97316", fontWeight: "600" },
  metaRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  metaCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  metaValue: { fontSize: 16, fontWeight: "700", color: "#292524" },
  metaLabel: { fontSize: 11, color: "#9ca3af" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: "#292524", marginBottom: 12 },
  ingredientRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  ingredientDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: "#f97316", marginTop: 6,
  },
  ingredientText: { fontSize: 15, color: "#374151", flex: 1 },
  ingredientQty: { fontWeight: "600" },
  optional: { color: "#9ca3af", fontSize: 13 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 12, alignItems: "flex-start" },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#f97316", alignItems: "center", justifyContent: "center",
  },
  stepNumberText: { color: "white", fontWeight: "700", fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, color: "#374151", lineHeight: 22 },
  tipsBox: {
    backgroundColor: "#fff7ed",
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
    padding: 16,
    borderRadius: 10,
    marginBottom: 24,
  },
  tipsText: { fontSize: 14, color: "#374151", lineHeight: 20 },
  footerBack: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 40,
  },
  footerBackText: { color: "#f97316", fontWeight: "600", fontSize: 15 },
});