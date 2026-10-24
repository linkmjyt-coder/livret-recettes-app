import { useState, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { ChefHat, Search, Plus, X } from "lucide-react-native";
import RecipeCard from "../components/RecipeCard";
import { getAllRecipes } from "../services/recipesService";

const CATEGORIES = [
  { label: "Toutes", value: "all" },
  { label: "Entrées", value: "entrée" },
  { label: "Plats", value: "plat principal" },
  { label: "Desserts", value: "dessert" },
  { label: "Apéritifs", value: "apéritif" },
  { label: "Boissons", value: "boisson" },
];

const HERO_HEIGHT = 220;

// Mémoïsé : évite que chaque carte se re-render à chaque frame de scroll
// (le parent re-render souvent à cause du state du header animé).
const MemoRecipeCard = memo(RecipeCard);

export default function Home() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const scrollY = useRef(new Animated.Value(0)).current;

  const loadRecipes = useCallback(() => {
    setLoading(true);
    getAllRecipes()
      .then(setRecipes)
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(loadRecipes);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    getAllRecipes()
      .then(setRecipes)
      .finally(() => setRefreshing(false));
  }, []);

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesCategory =
      selectedCategory === "all" || recipe.category === selectedCategory;
    if (!searchQuery) return matchesCategory;
    const q = searchQuery.toLowerCase();
    return (
      matchesCategory &&
      (recipe.title?.toLowerCase().includes(q) ||
        recipe.description?.toLowerCase().includes(q) ||
        recipe.ingredients?.some((i) => i.name?.toLowerCase().includes(q)))
    );
  });

  const statsTotal = recipes.length;
  const statsWeek = recipes.filter((r) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(r.created_date) > weekAgo;
  }).length;

  // Animation du hero — uniquement transform + opacity => useNativeDriver: true.
  // (La version précédente animait `height`, ce qui force le JS thread à
  // recalculer le layout à chaque frame de scroll : c'était la cause
  // principale du saccadement.)
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT],
    extrapolate: "clamp",
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const renderItem = useCallback(
    ({ item }) => <MemoRecipeCard recipe={item} />,
    []
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  const ListHeader = useCallback(
    () => (
      <View style={styles.searchBox}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabs}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              style={[
                styles.tab,
                selectedCategory === cat.value && styles.tabActive,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedCategory === cat.value && styles.tabTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    ),
    [searchQuery, selectedCategory]
  );

  const ListEmpty = useCallback(() => {
    if (loading) {
      return (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      );
    }
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Aucune recette</Text>
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push("/add-recipe")}
        >
          <Text style={styles.emptyButtonText}>+ Ajouter une recette</Text>
        </TouchableOpacity>
      </View>
    );
  }, [loading, router]);

  return (
    <View style={styles.container}>
      {/* HERO ANIMÉ — au-dessus de la liste, translate + fade au scroll */}
      <Animated.View
        style={[
          styles.hero,
          {
            transform: [{ translateY: heroTranslateY }],
            opacity: heroOpacity,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.heroTop}>
          <ChefHat color="white" size={28} />
          <Text style={styles.heroTag}>Recettes de Famille</Text>
        </View>

        <Text style={styles.heroTitle}>Nos Meilleures{"\n"}Recettes</Text>
        <Text style={styles.heroSubtitle}>
          Partagez et découvrez les secrets culinaires
        </Text>

        <View style={styles.heroBottom}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-recipe")}
          >
            <Plus size={18} color="#f97316" />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statsTotal}</Text>
              <Text style={styles.statLabel}>Recettes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{statsWeek}</Text>
              <Text style={styles.statLabel}>Cette semaine</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* LISTE — contentContainerStyle.paddingTop réserve l'espace du hero */}
      <Animated.FlatList
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: HERO_HEIGHT,
          paddingHorizontal: 16,
          paddingBottom: 16,
          flexGrow: 1,
        }}
        data={filteredRecipes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#f97316"]}
            tintColor="#f97316"
            progressViewOffset={HERO_HEIGHT}
          />
        }
        // Réglages perf : n'affiche/monte que ce qui est visible + un buffer
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        updateCellsBatchingPeriod={50}
        windowSize={7}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF5",
  },
  hero: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT,
    backgroundColor: "#f97316",
    paddingHorizontal: 24,
    paddingTop: 48,
    overflow: "hidden",
    zIndex: 10,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  heroTag: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
    lineHeight: 40,
  },
  heroSubtitle: {
    color: "#fff7ed",
    fontSize: 14,
    marginBottom: 20,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: 14,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 16,
  },
  statItem: { alignItems: "center" },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "white" },
  statLabel: { fontSize: 11, color: "#fed7aa" },
  statDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.3)" },
  scrollView: { flex: 1 },
  searchBox: {
    backgroundColor: "white",
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabs: { marginTop: 12 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#f3f4f6",
  },
  tabActive: { backgroundColor: "#f97316" },
  tabText: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  tabTextActive: { color: "white", fontWeight: "700" },
  list: { padding: 16, paddingTop: 0 },
  empty: { alignItems: "center", paddingVertical: 48 },
  emptyTitle: { fontSize: 20, fontWeight: "600", color: "#374151", marginBottom: 16 },
  emptyButton: {
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: { color: "white", fontWeight: "bold" },
});