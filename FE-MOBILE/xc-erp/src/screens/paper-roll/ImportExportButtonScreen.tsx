import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Navigator param types used in your app. Adjust if your app defines these elsewhere.
type RootStackParamList = {
  Scan: undefined;
  ImportExportButton: { qrText: string };
  Detail: { qrText: string; action?: "import" | "export" };
};

type Props = NativeStackScreenProps<RootStackParamList, "ImportExportButton">;

export default function ImportExportButtonScreen({ route, navigation }: Props) {
  const { qrText } = route.params;

  const go = (action: "import" | "export") => {
    navigation.navigate("Detail", { qrText, action });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chọn thao tác</Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.bigButton, styles.importButton]}
        onPress={() => go("import")}
      >
        <Text style={styles.bigButtonText}>Nhập</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.bigButton, styles.exportButton]}
        onPress={() => go("export")}
      >
        <Text style={styles.bigButtonText}>Xuất</Text>
      </TouchableOpacity>

      {/* small back button area */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backFooter}
        activeOpacity={0.8}
      >
        <Text style={styles.backText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8fafb",
    justifyContent: "center",
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
    textAlign: "center",
  },
  bigButton: {
    height: 140,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  importButton: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  exportButton: {
    backgroundColor: "#fdf2f8",
    borderWidth: 1,
    borderColor: "#fbcfe8",
  },
  bigButtonText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
  },
  backFooter: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 22 : 16,
    alignItems: "center",
  },
  backText: { color: "#0a84ff", fontWeight: "700" },
});
