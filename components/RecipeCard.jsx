import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Clock, Flame, Users, Pencil } from "lucide-react-native";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import { auth } from "../firebase";

const categoryColors = {
  "entrée": { bg: "#dbeafe", text: "#1e40af" },
  "plat principal": { bg: "#ede9fe", text: "#6b21a8" },
  "dessert": { bg: "#fce7f3", text: "#9d174d" },
  "apéritif": { bg: "#fef3c7", text: "#92400e" },
  "boisson": { bg: "#cffafe", text: "#155e75" },
  "sauce": { bg: "#ffedd5", text: "#9a3412" },
  "accompagnement": { bg: "#ecfccb", text: "#3f6212" },
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop";

// Placeholder flou très léger pendant le chargement (évite un flash blanc/gris)
const BLURHASH = "L5H2EC=PM+yV0g-mq.wG9c010J}I";

export default function RecipeCard({ recipe }) {
  const router = useRouter();

  const handlePress = () => {
    if (recipe.url && recipe.url.startsWith("http")) {
      Linking.openURL(recipe.url);
    } else {
      router.push(`/recipe/${recipe.id}`);
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${recipe.id}`);
  };

  const catColor = categoryColors[recipe.category] || { bg: "#f3f4f6", text: "#374151" };
  const isExternalLink = recipe.url && recipe.url.startsWith("http");
  const isOwner = auth.currentUser?.uid === recipe.addedBy?.uid;

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.image_url || FALLBACK_IMAGE }}
            style={styles.image}
            contentFit="cover"
            transition={150}
            placeholder={{ blurhash: BLURHASH }}
            cachePolicy="memory-disk"
            // Évite que l'image d'une carte recyclée par la FlatList
            // affiche brièvement l'image précédente avant de charger la bonne.
            recyclingKey={String(recipe.id)}
          />
          {recipe.category && (
            <View style={[styles.badge, { backgroundColor: catColor.bg }]}>
              <Text style={[styles.badgeText, { color: catColor.text }]}>
                {recipe.category}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>

          {/* TITRE + BOUTON MODIFIER */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {recipe.title} {isExternalLink ? "🔗" : ""}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation?.();
                handleEdit();
              }}
            >
              <Pencil size={12} color="#f97316" />
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          </View>

          {recipe.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {recipe.description}
            </Text>
          ) : null}

          {/* QUI A AJOUTÉ */}
          {isOwner && recipe.addedBy?.name ? (
            <Text style={styles.addedBy}>
              👤 Ajouté par : {recipe.addedBy.name}
            </Text>
          ) : null}

          <View style={styles.meta}>
            {recipe.prep_time ? (
              <View style={styles.metaItem}>
                <Clock size={14} color="#f97316" />
                <Text style={styles.metaText}>{recipe.prep_time}min</Text>
              </View>
            ) : null}
            {recipe.cook_time ? (
              <View style={styles.metaItem}>
                <Flame size={14} color="#f97316" />
                <Text style={styles.metaText}>{recipe.cook_time}min</Text>
              </View>
            ) : null}
            {recipe.servings ? (
              <View style={styles.metaItem}>
                <Users size={14} color="#f97316" />
                <Text style={styles.metaText}>{recipe.servings}</Text>
              </View>
            ) : null}
          </View>

        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 6,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#292524",
    flex: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fff7ed",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f97316",
  },
  editButtonText: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 8,
  },
  addedBy: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6b7280",
  },
});