// src/screens/DetailScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { parseMaCuon } from "../../utils/parseMaCuon";

// RTK Query hooks from your slice
import {
  useGetPaperRollByPaperRollIdQuery,
  useGetPaperRollsQuery,
  useUpdatePaperRollMutation,
} from "../../service/api/paperRollApiSlice";
import { PAPER_ROLL_URL } from "@/service/constants";

type RootStackParamList = {
  Scan: undefined;
  Detail: { qrText: string };
};
type Props = NativeStackScreenProps<RootStackParamList, "Detail">;

function getIdFromDoc(doc: any): string | undefined {
  if (!doc) return undefined;
  if (typeof doc === "string") return doc;
  if (typeof doc === "number") return String(doc);
  if (doc._id?.$oid) return String(doc._id.$oid);
  if (doc._id) return String(doc._id);
  if (doc.id) return String(doc.id);
  return undefined;
}

export default function PaperDetailScreen({ route, navigation }: Props) {
  const { qrText } = route.params;

  const {
    data: detailResp,
    isLoading: detailLoading,
    isError: detailError,
    refetch: refetchDetail,
  } = useGetPaperRollByPaperRollIdQuery({
    paperRollId: encodeURIComponent(qrText),
  });

  const {
    data: listResp,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetPaperRollsQuery({
    page: 1,
    limit: 5,
    search: qrText,
  });

  const [updatePaperRoll, { isLoading: updating }] =
    useUpdatePaperRollMutation();

  const foundFromDetail =
    detailResp?.data?.data?.[0] ?? detailResp?.data ?? null;

  console.log("qrtext: ", qrText);
  console.log("foundFromDetail: ", foundFromDetail);
  console.log("detailResp:", detailResp);
  console.log("detailLoading:", detailLoading);
  console.log("detailError:", detailError);
  console.log("PAPER_ROLL_URL:", PAPER_ROLL_URL);
  console.log("built url:", `${PAPER_ROLL_URL}/detail-by-paper-roll/${qrText}`);

  React.useEffect(() => {
    const url = `${PAPER_ROLL_URL}/detail-by-paper-roll/${encodeURIComponent(
      qrText
    )}`;
    console.log("fetch test url:", url);
    fetch(url, { method: "GET", credentials: "include" })
      .then((r) => r.text())
      .then((txt) => console.log("fetch raw response:", txt))
      .catch((err) => console.log("fetch error:", err));
  }, [qrText]);

  let foundFromList: any = null;
  const paginated = listResp?.data ?? listResp;
  if (paginated) {
    if (Array.isArray(paginated?.data)) foundFromList = paginated.data[0];
    else if (Array.isArray(paginated?.data?.data))
      foundFromList = paginated.data.data[0];
    else if (Array.isArray(paginated?.data?.docs))
      foundFromList = paginated.data.docs[0];
    else if (Array.isArray(paginated?.data?.items))
      foundFromList = paginated.data.items[0];
  }

  const doc = foundFromDetail ?? foundFromList ?? null;

  const initialWeight = doc?.weight ?? 0;
  const [localWeight, setLocalWeight] = useState<number>(initialWeight);
  React.useEffect(() => {
    setLocalWeight(doc?.weight ?? 0);
  }, [doc?.weight, doc?._id]);

  const parsed = parseMaCuon(qrText);

  const stableId = getIdFromDoc(doc) ?? qrText;

  const onExport = async () => {
    if ((localWeight ?? 0) <= 0) {
      return Alert.alert("Trọng lượng rỗng, không thể xuất");
    }
    if (!stableId) {
      return Alert.alert("Không xác định được cuộn để xuất");
    }

    Alert.alert(
      "Xác nhận",
      `Bạn muốn xuất toàn bộ cuộn ${qrText}? (sẽ set trọng lượng = 0)`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xuất",
          onPress: async () => {
            try {
              // optimistic update local UI
              setLocalWeight(0);

              // call backend to update weight = 0
              const res: any = await updatePaperRoll({
                id: stableId,
                data: { weight: 0 },
              }).unwrap();

              // optional: refresh server data in background
              refetchDetail?.();
              refetchList?.();

              Alert.alert("Đã xuất", res?.message ?? `Đã xuất ${qrText}`);
            } catch (err: any) {
              console.error("Export failed", err);
              // rollback local weight if something failed
              setLocalWeight(doc?.weight ?? 0);
              Alert.alert(
                "Lỗi",
                err?.data?.message ?? err?.message ?? "Xuất thất bại"
              );
            }
          },
        },
      ]
    );
  };

  // Re-import handler: update weight to provided number
  const [reimportValue, setReimportValue] = useState<string>("");

  const onReImport = async () => {
    const val = Number(reimportValue);
    if (!Number.isFinite(val) || val < 0) return Alert.alert("Nhập số hợp lệ");
    if (!stableId) return Alert.alert("Không xác định được cuộn để nhập");

    try {
      // optimistic update local UI
      setLocalWeight(val);

      const res: any = await updatePaperRoll({
        id: stableId,
        data: { weight: val },
      }).unwrap();

      // background refetch
      refetchDetail?.();
      refetchList?.();

      Alert.alert(
        "Nhập lại",
        res?.message ?? `Đã nhập lại ${val} kg cho ${qrText}`
      );
      setReimportValue("");
    } catch (err: any) {
      console.error("reimport failed", err);
      // rollback if needed
      setLocalWeight(doc?.weight ?? 0);
      Alert.alert("Lỗi", err?.data?.message ?? err?.message ?? "Nhập thất bại");
    }
  };

  // Loading / not found states
  const anyLoading = detailLoading || listLoading;
  if (anyLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Đang lấy thông tin...</Text>
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Chi tiết</Text>
        <Text style={{ marginTop: 16 }}>
          Không tìm thấy cuộn có mã: {qrText}
        </Text>
        <View style={{ marginTop: 16 }}>
          <Button title="Quay lại" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  // Render the same layout you had, but use localWeight to show current weight
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Chi tiết cuộn</Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.left}>
              <Text style={styles.label}>Mã giấy</Text>
              <Text style={styles.value}>
                <Text style={styles.bold}>{qrText}</Text>
              </Text>

              <View style={styles.attrRow}>
                <Text style={styles.labelSmall}>Màu</Text>
                <Text style={styles.valueSmall}>
                  {parsed?.color || (doc.paperType?.paperColor?.title ?? "-")}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.labelSmall}>NCC</Text>
                <Text style={styles.valueSmall}>
                  {doc.paperSupplier?.name ?? parsed?.supplierCode ?? "-"}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.labelSmall}>Khổ</Text>
                <Text style={styles.valueSmall}>
                  {doc.paperType?.width ?? parsed?.width ?? "-"}
                </Text>
              </View>

              <View style={styles.attrRow}>
                <Text style={styles.labelSmall}>Định lượng</Text>
                <Text style={styles.valueSmall}>
                  {doc.paperType?.grammage ?? parsed?.grammage ?? "-"}
                </Text>
              </View>
            </View>

            <View style={styles.right}>
              <Text style={styles.smallLabel}>Tồn</Text>
              <Text style={styles.bigValue}>{localWeight ?? 0}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <View style={styles.actionBtn}>
            <Button title="Xuất" onPress={onExport} disabled={updating} />
          </View>
          <View style={styles.actionBtn}>
            <Button
              title="Nhập"
              onPress={() => {
                /* focus reimport input if needed */
              }}
            />
          </View>
        </View>

        <View style={styles.reimportBox}>
          <Text style={styles.reimportTitle}>Điền trọng lượng để nhập lại</Text>

          <TextInput
            placeholder="Số kg nhập lại"
            value={reimportValue}
            onChangeText={setReimportValue}
            keyboardType="numeric"
            style={styles.input}
          />
          <View style={{ marginTop: 8 }}>
            <Button
              title={updating ? "Đang lưu..." : "Xác nhận nhập"}
              onPress={onReImport}
              disabled={updating}
            />
          </View>
        </View>

        <View style={{ height: 96 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.footerButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8fafb" },
  scrollContent: { paddingBottom: 8 },

  header: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  bold: { fontWeight: "700" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  row: { flexDirection: "row", alignItems: "center" },
  left: { flex: 1, paddingRight: 12 },
  right: { width: 120, alignItems: "center" },

  label: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  value: { fontSize: 15, color: "#111827" },

  labelSmall: { fontSize: 12, color: "#6b7280" },
  valueSmall: { fontSize: 14, color: "#111827", fontWeight: "600" },
  attrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  smallLabel: { color: "#6b7280", fontSize: 12, marginBottom: 6 },
  bigValue: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    minWidth: 90,
  },

  actionsRow: {
    flexDirection: "row",
    marginTop: 16,
    justifyContent: "space-between",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e6edf3",
    marginHorizontal: 4,
  },

  reimportBox: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e6edf3",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  reimportTitle: { marginBottom: 8, color: "#374151", fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderColor: "#e6edf3",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fbfdff",
  },

  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "ios" ? 22 : 16,
    alignItems: "center",
  },

  footerButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0a84ff",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtonText: {
    color: "#0a84ff",
    fontWeight: "700",
    fontSize: 16,
  },
});
