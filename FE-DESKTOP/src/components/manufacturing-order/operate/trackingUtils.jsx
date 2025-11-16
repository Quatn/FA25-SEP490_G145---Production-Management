export const formatNumber = (num) => {
  if (num === null || num === undefined) return "-";
  return new Intl.NumberFormat("vi-VN").format(num);
};

// Hàm lấy style cho toàn bộ hàng dựa trên trạng thái quy trình sóng
export const getRowStyles = (item) => {
  const baseStyle = {
    fontWeight: "500",
    color: "#000000",
    textDecoration: "none",
    backgroundColor: "white",
  };

  const corrugatorStatus =
    typeof item?.corrugatorProcess === "object" &&
    item?.corrugatorProcess !== null
      ? item.corrugatorProcess.status
      : null;

  switch (corrugatorStatus) {
    case "COMPLETED":
      return {
        ...baseStyle,
        backgroundColor: "#c8e6c9",
        fontWeight: "600",
        color: "#2e7d32",
      };
    case "RUNNING":
      return {
        ...baseStyle,
        backgroundColor: "#fff9c4",
      };
    case "PAUSED":
      return {
        ...baseStyle,
        backgroundColor: "#ffe0b2",
        color: "#e65100",
      };
    case "NOTSTARTED":
      return {
        ...baseStyle,
        backgroundColor: "#e3f2fd",
      };
    case "OVERCOMPLETED":
      return {
        ...baseStyle,
        backgroundColor: "#ffcdd2",
      };
    case "CANCELLED":
      return {
        ...baseStyle,
        backgroundColor: "#fbe6e8",
        textDecoration: "line-through",
        color: "#c62828",
      };
    default:
      return baseStyle;
  }
};

// Hàm lấy trạng thái
export const getStatus = (status) => {
  switch (status) {
    case "NOTSTARTED":
      return "Chờ";
    case "RUNNING":
      return "Chạy";
    case "COMPLETED":
      return "Hoàn Thành";
    case "PAUSED":
      return "Dừng";
    case "CANCELLED":
      return "Hủy";
    case "OVERCOMPLETED":
      return "Vượt Mức";
    default:
      return "-";
  }
};

// Mảng các trạng thái có thể chỉnh sửa
export const EDITABLE_STATUSES = [
  { value: "RUNNING", label: "Chạy" },
  { value: "PAUSED", label: "Dừng" },
  { value: "CANCELLED", label: "Hủy" },
  { value: "COMPLETED", label: "Hoàn Thành" },
];

// Mảng các trạng thái để filter
export const FILTER_STATUSES = [
  { value: "NOTSTARTED", label: "Chờ" },
  { value: "RUNNING", label: "Chạy" },
  { value: "PAUSED", label: "Dừng" },
  { value: "COMPLETED", label: "Hoàn Thành" },
  { value: "CANCELLED", label: "Hủy" },
];

// Hàm format ngày (ngắn)
export const formatShortDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date)) return "-";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}`;
};