// --- HÀM UTILITY (TIỆN ÍCH) ---

// Hàm format số lượng thành định dạng 1.500
export const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat("vi-VN").format(num);
  };
  
  // Hàm lấy style cho toàn bộ hàng (ROW STYLE)
  export const getRowStyles = (item) => {
    const baseStyle = {
      fontWeight: "500",
      backgroundColor: "white",
    };
  
    switch (item?.overallStatus) {
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
  
  // Hàm dịch Status
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
  
  // Hàm format ngày
  export const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}`;
  };
  
  // --- HẰNG SỐ (CONSTANTS) ---
  
  export const SCROLL_HEADER_BG = "#e3f2fd";
  export const AMOUNT_CELL_STYLE = { textDecoration: "underline", fontWeight: "600", color: "red" };
  
  // Header cho bảng cố định (Tab Kế Hoạch)
  export const FIXED_HEADERS = [
    "Lệnh SX",
    "Khách hàng",
    "Mã Hàng",
    "Sóng",
    // "Dài",
    // "Rộng",
    // "Cao",
    "SL",
    "Trạng thái",
    "Ngày Nhận",
    "Ngày Giao",
  ];