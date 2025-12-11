import ConfirmProvider from "@/components/common/ConfirmModal";
import DeletedProduct from "@/components/products-management/DeletedProduct";
export default function ProductManagement() {
  return (
    <ConfirmProvider>
      <DeletedProduct />
    </ConfirmProvider>
  );
}
