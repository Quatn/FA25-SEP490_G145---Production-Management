import ConfirmProvider from "@/components/common/ConfirmModal";
import PaperRollRestore from "@/components/paper-storage-management/PaperRollRestore";

export default function Page() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Các cuộn giấy đã xóa</h2>
      <ConfirmProvider>
        <PaperRollRestore />
      </ConfirmProvider>
    </div>
  );
}
