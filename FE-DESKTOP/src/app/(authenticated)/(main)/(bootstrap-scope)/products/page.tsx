import ConfirmProvider from "@/components/common/ConfirmModal";
import ProductList from "@/components/products-management/ProductList";
export default function ProductManagement() {
  return (
    <ConfirmProvider>
      <ProductList />
    </ConfirmProvider>
  );
}
