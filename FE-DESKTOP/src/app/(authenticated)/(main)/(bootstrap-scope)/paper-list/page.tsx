import ConfirmProvider from "@/components/common/ConfirmModal";
import PaperStorageApp from "@/components/paper-storage-management/PaperStorageApp";

export default function Page() {
  return (
    <div style={{ padding: 16 }}>
      <ConfirmProvider>
        <PaperStorageApp />
      </ConfirmProvider>
    </div>
  );
}
