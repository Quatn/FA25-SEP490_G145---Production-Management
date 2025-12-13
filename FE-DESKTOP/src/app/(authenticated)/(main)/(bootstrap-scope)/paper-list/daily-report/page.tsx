import ConfirmProvider from "@/components/common/ConfirmModal";
import PaperDailyUsageReport from "@/components/paper-storage-management/PaperDailyReportUsage";

export default function Page() {
  return (
    <div style={{ padding: 16 }}>
      <ConfirmProvider>
        <PaperDailyUsageReport />
      </ConfirmProvider>
    </div>
  );
}
