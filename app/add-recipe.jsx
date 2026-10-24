import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, PenLine, Link as LinkIcon } from "lucide-react-native";
import { addRecipe } from "../services/recipesService";
import ManualRecipeForm from "../components/ManualRecipeForm";
import UrlRecipeForm from "../components/UrlRecipeForm";
import { sendRecipeNotification } from "../utils/notifications";

export default function AddRecipe() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (recipeData) => {
    setIsSubmitting(true);
    try {
      await addRecipe(recipeData);
          await sendRecipeNotification(recipeData.title);
      Alert.alert("✅ Succès", "Recette ajoutée avec succès !", [
        { text: "OK", onPress: () => router.push("/") },
      ]);
    } catch (err) {
      Alert.alert("Erreur", "Impossible d'ajouter la recette.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("/")}
        >
          <ArrowLeft size={20} color="#f97316" />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Ajouter une Recette</Text>
        <Text style={styles.subtitle}>
          Partagez vos secrets culinaires avec la famille
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "manual" && styles.tabActive]}
          onPress={() => setActiveTab("manual")}
        >
          <PenLine size={16} color={activeTab === "manual" ? "#f97316" : "#6b7280"} />
          <Text style={[styles.tabText, activeTab === "manual" && styles.tabTextActive]}>
            Manuel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "url" && styles.tabActive]}
          onPress={() => setActiveTab("url")}
        >
          <LinkIcon size={16} color={activeTab === "url" ? "#f97316" : "#6b7280"} />
          <Text style={[styles.tabText, activeTab === "url" && styles.tabTextActive]}>
            Depuis un lien
          </Text>
        </TouchableOpacity>
      </View>

      {/* FORMULAIRE */}
      <View style={styles.formContainer}>
        {activeTab === "manual" ? (
          <ManualRecipeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        ) : (
          <UrlRecipeForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBF5",
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#fff7ed",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    color: "#f97316",
    fontSize: 15,
    fontWeight: "500",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#292524",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  tabsContainer: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#fff7ed",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#f97316",
    fontWeight: "700",
  },
  formContainer: {
    padding: 16,
  },
});