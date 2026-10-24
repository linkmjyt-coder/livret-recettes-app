import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

// Stockage global des logs d'erreur
const errorLogs = [];
const originalConsoleError = console.error;
console.error = (...args) => {
  errorLogs.push({
    time: new Date().toLocaleTimeString(),
    message: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
  });
  originalConsoleError(...args);
};

export default function Profile() {
  const user = auth.currentUser;
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (showLogs) {
      setLogs([...errorLogs]);
    }
  }, [showLogs]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const clearLogs = () => {
    errorLogs.length = 0;
    setLogs([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={styles.card}>
        <Text style={styles.emoji}>👤</Text>
        <Text style={styles.name}>
          {user?.displayName || "Utilisateur"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>↩ Se déconnecter</Text>
      </TouchableOpacity>

      {/* BOUTON LOGS */}
      <TouchableOpacity
        style={[styles.logsButton, showLogs && styles.logsButtonActive]}
        onPress={() => setShowLogs(!showLogs)}
      >
        <Text style={styles.logsButtonText}>
          {showLogs ? "🔴 Masquer les logs" : "🟢 Afficher les logs"}
        </Text>
      </TouchableOpacity>

      {/* LOGS */}
      {showLogs && (
        <View style={styles.logsContainer}>
          <View style={styles.logsHeader}>
            <Text style={styles.logsTitle}>
              Logs d'erreur ({logs.length})
            </Text>
            <TouchableOpacity onPress={clearLogs}>
              <Text style={styles.clearText}>Effacer</Text>
            </TouchableOpacity>
          </View>

          {logs.length === 0 ? (
            <Text style={styles.noLogs}>✅ Aucune erreur détectée</Text>
          ) : (
            logs.map((log, i) => (
              <View key={i} style={styles.logItem}>
                <Text style={styles.logTime}>{log.time}</Text>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))
          )}
        </View>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFBF5",
    padding: 24,
    alignItems: "center",
    paddingTop: 60,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: "bold", color: "#292524", marginBottom: 4 },
  email: { fontSize: 14, color: "#6b7280" },
  button: {
    width: "100%",
    backgroundColor: "#f97316",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  logsButton: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
    marginBottom: 16,
  },
  logsButtonActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  logsButtonText: { fontSize: 14, fontWeight: "600", color: "#374151" },
  logsContainer: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  logsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  logsTitle: { color: "#9ca3af", fontSize: 13, fontWeight: "600" },
  clearText: { color: "#ef4444", fontSize: 13, fontWeight: "600" },
  noLogs: { color: "#4ade80", fontSize: 13, textAlign: "center", paddingVertical: 8 },
  logItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingBottom: 10,
  },
  logTime: { color: "#6b7280", fontSize: 11, marginBottom: 2 },
  logMessage: { color: "#fca5a5", fontSize: 12, fontFamily: "monospace" },
});