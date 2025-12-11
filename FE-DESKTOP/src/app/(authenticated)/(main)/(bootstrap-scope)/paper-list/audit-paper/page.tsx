import ConfirmProvider from "@/components/common/ConfirmModal";
import PaperRollAudit from "@/components/paper-storage-management/PaperRollAudit";

export default function Page() {
  return (
    <div style={{ padding: 16 }}>
      <ConfirmProvider>
        <PaperRollAudit />
      </ConfirmProvider>
    </div>
  );
}
