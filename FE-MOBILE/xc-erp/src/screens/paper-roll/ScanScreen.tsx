// src/screens/ScanScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Scan: undefined;
  Detail: { qrText: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "Scan">;

export default function ScanScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>("back");
  const [scanned, setScanned] = useState(false);
  const [manual, setManual] = useState("");

  // If permissions are still loading
  if (!permission) return <Text>Requesting camera permission...</Text>;

  // Not granted yet
  if (!permission.granted)
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>Chúng tôi cần quyền truy cập camera</Text>
        <Button title="Cho phép" onPress={() => requestPermission()} />
      </View>
    );

  const handleBarcodeScanned = ({ type, data }: { type?: string; data: string }) => {
    if (!data) return;
    setScanned(true);
    navigation.navigate("Detail", { qrText: data });
  };

  const onManualGo = () => {
    const t = manual.trim();
    if (!t) return Alert.alert("Vui lòng nhập mã cuộn");
    navigation.navigate("Detail", { qrText: t });
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quét QR / Barcode</Text>

      <View style={styles.scannerBox}>
        <CameraView
          facing={facing}
          // new API name for the event
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          // prefer QR codes
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* simple visual guide + flip button */}
        <View pointerEvents="none" style={styles.overlay}>
          <View style={styles.focusBox} />
        </View>

        <View style={styles.controlsOverlay} pointerEvents="box-none">
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>Flip</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginTop: 12 }}>
        <Button title={scanned ? "Quét lại" : "Đang chờ quét"} onPress={() => setScanned(false)} />
      </View>

      <View style={{ marginTop: 18 }}>
        <Text style={{ marginBottom: 8 }}>Nhập mã giấy thủ công (nếu không quét được)</Text>
        <TextInput
          placeholder="K/VT/120/110/..."
          value={manual}
          onChangeText={setManual}
          style={styles.input}
        />
        <View style={{ marginTop: 8 }}>
          <Button title="Mở chi tiết" onPress={onManualGo} />
        </View>
      </View>

      {/* tip for iOS if useful */}
      {Platform.OS === "ios" && (
        <Text style={styles.iosTip}>iOS: use a physical device (Simulator has no camera).</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  scannerBox: {
    width: "100%",
    height: 340,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  focusBox: {
    width: "62%",
    height: "42%",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 12,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  flipText: { color: "#fff", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8 },
  iosTip: { marginTop: 12, fontSize: 12, color: "#777" },
  permissionContainer: { flex: 1, justifyContent: "center", padding: 16 },
  message: { textAlign: "center", paddingBottom: 10 },
});
