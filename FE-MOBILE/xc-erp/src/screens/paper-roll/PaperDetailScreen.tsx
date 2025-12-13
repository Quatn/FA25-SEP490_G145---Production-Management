// src/screens/paper-roll/PaperDetailScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
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
  useGetPaperRollDetailQuery,
  useGetPaperRollsQuery,
  useUpdatePaperRollMutation,
} from "../../service/api/paperRollApiSlice";
import { useGetAllPaperColorsQuery } from "@/service/api/paperColorApiSlice";
import { useGetAllPaperSuppliersQuery } from "@/service/api/paperSupplierApiSlice";
import { useGetAllPaperTypesQuery } from "@/service/api/paperTypeApiSlice";
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
  } = useGetPaperRollDetailQuery({
    id: encodeURIComponent(qrText),
  });

  const {
    data: listResp,
    isLoading: listLoading,
    refetch: refetchList,
  } = useGetPaperRollsQuery({
    page: 1,
    limit: 1000,
    search: qrText,
  });

  const getColorIdFromPaperType = (pt: any) => {
    if (!pt) return undefined;
    if (pt.paperColor && typeof pt.paperColor === "object")
      return getIdFromDoc(pt.paperColor);
    return getIdFromDoc(pt.paperColor) ?? undefined;
  };

  const { data: colorsResp } = useGetAllPaperColorsQuery();
  const allColors: any[] = colorsResp?.data ?? colorsResp ?? [];

  const { data: suppliersResp } = useGetAllPaperSuppliersQuery();
  const allSuppliers: any[] = suppliersResp?.data ?? suppliersResp ?? [];

  const { data: typesResp } = useGetAllPaperTypesQuery();
  const allTypes: any[] = typesResp?.data ?? typesResp ?? [];

  // build maps for lookups
  const colorMap = useMemo(() => {
    const m = new Map<string, any>();
    (allColors || []).forEach((c: any) =>
      m.set(String(getIdFromDoc(c) ?? c.code ?? c.title), c)
    );
    return m;
  }, [allColors]);

  const supplierMap = useMemo(() => {
    const m = new Map<string, any>();
    (allSuppliers || []).forEach((s: any) =>
      m.set(String(getIdFromDoc(s) ?? s.code ?? s.name), s)
    );
    return m;
  }, [allSuppliers]);

  const typeMap = useMemo(() => {
    const m = new Map<string, any>();
    (allTypes || []).forEach((t: any) =>
      m.set(
        String(
          getIdFromDoc(t) ??
            t._id ??
            `${t.width}_${t.grammage}_${getIdFromDoc(t.paperColor)}`
        ),
        t
      )
    );
    return m;
  }, [allTypes]);

  const computePaperRollId = (r: any) => {
    const pt = r.paperType ?? r.paperTypeId ?? null;
    const colorId = getColorIdFromPaperType(pt);
    const colorObj = colorId ? colorMap.get(String(colorId)) : undefined;
    const colorCode = colorObj?.code;

    const supplierObj =
      r.paperSupplier ??
      (r.paperSupplierId
        ? supplierMap.get(String(getIdFromDoc(r.paperSupplierId)))
        : undefined);
    const supplierCode = supplierObj?.code ?? r.paperSupplier?.code;

    const width = pt?.width ?? r.width;
    const grammage = pt?.grammage ?? r.grammage;
    const seq = r.sequenceNumber ?? r.sequence;
    const receiving = r.receivingDate ?? r.createdAt;
    const yy = receiving
      ? new Date(receiving).getFullYear() % 100
      : new Date().getFullYear() % 100;

    if (
      colorCode &&
      supplierCode &&
      width != null &&
      grammage != null &&
      seq != null
    ) {
      if (seq > 0 && seq < 10) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0000${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 10 && seq < 100) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}000${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 100 && seq < 1000) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}00${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      if (seq >= 1000 && seq < 10000) {
        return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}0${seq}XC${String(
          yy
        ).padStart(2, "0")}`;
      }
      return `${colorCode}/${supplierCode}/${width}/${grammage}/${supplierCode}${seq}XC${String(
        yy
      ).padStart(2, "0")}`;
    }
    return r.paperRollId ?? "-";
  };

  const [updatePaperRoll, { isLoading: updating }] =
    useUpdatePaperRollMutation();

  const foundFromDetail =
    detailResp?.data?.data?.[0] ?? detailResp?.data ?? null;

  let foundFromList: any = null;
  const paginated = listResp?.data?.data ?? listResp;
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
      `Bạn muốn xuất toàn bộ cuộn ${computePaperRollId(
        doc
      )}? (sẽ set trọng lượng = 0)`,
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

              Alert.alert(
                "Đã xuất",
                res?.message ?? `Đã xuất ${computePaperRollId(doc)}`
              );
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
        res?.message ?? `Đã nhập lại ${val} kg cho ${computePaperRollId(doc)}`
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
          Không tìm thấy cuộn có mã: {computePaperRollId(doc)}
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
                <Text style={styles.bold}>{computePaperRollId(doc)}</Text>
              </Text>

              <View style={styles.attrRow}>
                <Text style={styles.labelSmall}>Màu</Text>
                <Text style={styles.valueSmall}>
                  {colorMap.get(getColorIdFromPaperType(doc.paperType) ?? "")
                    ?.title ?? "-"}
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
