import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { customerAdminPrivileges, customerGetPrivileges, finishedGoodGetPrivileges, fluteCombinationGetPrivileges, manufacturingOrderGetPrivileges, manufacturingOrderReadWritePrivileges, orderFinishingProcessGetPrivileges, orderFinishingProcessReadWritePrivileges, paperColorGetPrivileges, paperRollAdminPrivileges, paperRollGetPrivileges, paperSupplierGetPrivileges, paperTypeGetPrivileges, printColorGetPrivileges, productAdminPrivileges, productGetPrivileges, productTypeGetPrivileges, purchaseOrderAdminPrivileges, purchaseOrderGetPrivileges, semiFinishedGoodGetPrivileges, systemAdminPrivileges, wareAdminPrivileges, wareGetPrivileges, wareManufacturingProcessTypeGetPrivileges } from "@/types/CascadingAccessPrivileges";
import { createTreeCollection } from "@chakra-ui/react";
import check from "check-types";

export interface NodeWithPrivilege {
  id: string;
  name: string;
  href?: string;
  children?: NodeWithPrivilege[];
  requiredPrivileges?: AnyAccessPrivileges[];
}

export const fullTree: NodeWithPrivilege[] = [
  /* =========================
     QUẢN TRỊ
  ========================= */

  {
    id: "admin",
    name: "Quản trị",
    children: [
      {
        id: "restore",
        name: "Khôi phục dữ liệu",
        requiredPrivileges: [...systemAdminPrivileges],
        children: [
          {
            id: "customer-restore",
            name: "Khôi phục khách hàng",
            href: "/customer/restore-list",
            requiredPrivileges: [...customerAdminPrivileges],
          },
          {
            id: "purchase-order-restore",
            name: "Khôi phục đơn mua",
            href: "/purchase-order/restore-po",
            requiredPrivileges: [...purchaseOrderAdminPrivileges],
          },
          {
            id: "product-restore",
            name: "Khôi phục sản phẩm",
            href: "/products/restore-product",
            requiredPrivileges: [...productAdminPrivileges],
          },
          {
            id: "paper-roll-restore",
            name: "Khôi phục cuộn giấy",
            href: "/paper-list/restore-paper",
            requiredPrivileges: [...paperRollAdminPrivileges],
          },
          {
            id: "ware-restore",
            name: "Khôi phục mã hàng",
            href: "/ware/restore-ware",
            requiredPrivileges: [...wareAdminPrivileges],
          },
        ],
      },
    ],
  },

  /* =========================
     BAN KINH DOANH
  ========================= */

  {
    id: "business",
    name: "Ban kinh doanh",
    children: [
      {
        id: "customer-list",
        name: "Danh sách khách hàng",
        href: "/customer/list",
        requiredPrivileges: [...customerGetPrivileges],
      },
      {
        id: "purchase-order-list",
        name: "Danh sách đơn hàng",
        href: "/purchase-order",
        requiredPrivileges: [...purchaseOrderGetPrivileges],
      },
      {
        id: "product-list",
        name: "Danh sách sản phẩm",
        href: "/products",
        requiredPrivileges: [...productGetPrivileges, ...purchaseOrderGetPrivileges],
      },
      {
        id: "product-type-list",
        name: "Danh sách loại sản phẩm",
        href: "/product-type/list",
        requiredPrivileges: [...productTypeGetPrivileges],
      },
      {
        id: "ware-list",
        name: "Danh sách mã hàng",
        href: "/ware",
        requiredPrivileges: [...purchaseOrderGetPrivileges, ...wareGetPrivileges],
      },
    ],
  },

  /* =========================
     BAN KẾ HOẠCH
  ========================= */

  {
    id: "planning",
    name: "Ban kế hoạch",
    children: [
      {
        id: "mo-dashboard",
        name: "Dashboard lệnh sản xuất",
        href: "/manufacturing-order",
        requiredPrivileges: [...manufacturingOrderGetPrivileges],
      },
      {
        id: "mo-list",
        name: "Danh sách lệnh sản xuất",
        href: "/manufacturing-order/list",
        requiredPrivileges: [...manufacturingOrderGetPrivileges],
      },
      {
        id: "mo-create",
        name: "Tạo lệnh sản xuất",
        href: "/manufacturing-order/create",
        requiredPrivileges: [...manufacturingOrderReadWritePrivileges],
      },
      {
        id: "flute-combination-list",
        name: "Danh sách tổ hợp sóng",
        href: "/flute-combination/list",
        requiredPrivileges: [...fluteCombinationGetPrivileges],
      },
      {
        id: "print-color-list",
        name: "Danh sách màu in",
        href: "/print-color/list",
        requiredPrivileges: [...printColorGetPrivileges],
      },
      {
        id: "order-finishing-process",
        name: "Danh sách quy trình hoàn thiện",
        href: "/order-finishing-process",
        requiredPrivileges: [...orderFinishingProcessGetPrivileges],
      },
      {
        id: "ware-manufacturing-process-type",
        name: "Danh sách kiểu gia công sản phẩm",
        href: "/ware-manufacturing-process-type/list",
        requiredPrivileges: [...wareManufacturingProcessTypeGetPrivileges],
      },
    ],
  },

  /* =========================
     BỘ PHẬN SÓNG
  ========================= */

  {
    id: "corrugation",
    name: "Bộ phận sóng",
    children: [
      {
        id: "corrugator-operate",
        name: "Thao tác quy trình sóng",
        href: "/manufacturing-order/corrugator-process-operate",
        requiredPrivileges: [...manufacturingOrderReadWritePrivileges],
      },
    ],
  },

  /* =========================
     BỘ PHẬN HOÀN THIỆN
  ========================= */

  {
    id: "finishing",
    name: "Bộ phận hoàn thiện",
    children: [
      {
        id: "finishing-operate",
        name: "Thao tác quy trình hoàn thiện",
        href: "/order-finishing-process",
        requiredPrivileges: [...orderFinishingProcessReadWritePrivileges],
      },
    ],
  },

  /* =========================
     KHO GIẤY
  ========================= */

  {
    id: "paper-warehouse",
    name: "Kho giấy",
    children: [
      {
        id: "paper-roll-list",
        name: "Danh sách cuộn giấy",
        href: "/paper-list",
        requiredPrivileges: [...paperRollGetPrivileges],
      },
      {
        id: "paper-audit",
        name: "Kiểm kê kho giấy",
        href: "/paper-list/audit-paper",
        requiredPrivileges: [...paperRollGetPrivileges],
      },
      {
        id: "paper-daily-report",
        name: "Báo cáo sử dụng giấy",
        href: "/paper-list/daily-report",
        requiredPrivileges: [...paperRollGetPrivileges],
      },
      {
        id: "paper-supplier",
        name: "Danh sách nhà giấy",
        href: "/paper-supplier/list",
        requiredPrivileges: [...paperSupplierGetPrivileges],
      },
      {
        id: "paper-color",
        name: "Danh sách màu giấy",
        href: "/paper-color/list",
        requiredPrivileges: [...paperColorGetPrivileges],
      },
      {
        id: "paper-type",
        name: "Danh sách loại giấy",
        href: "/paper-type/list",
        requiredPrivileges: [...paperTypeGetPrivileges],
      },
    ],
  },

  /* =========================
     KHO PHÔI
  ========================= */

  {
    id: "semi-finished-good",
    name: "Kho phôi",
    children: [
      {
        id: "sfg-dashboard",
        name: "Dashboard kho phôi",
        href: "/semi-finished-good/dashboard",
        requiredPrivileges: [...semiFinishedGoodGetPrivileges],
      },
      {
        id: "sfg-list",
        name: "Danh sách phôi",
        href: "/semi-finished-good/list",
        requiredPrivileges: [...semiFinishedGoodGetPrivileges],
      },
      {
        id: "sfg-audit",
        name: "Kiểm kê kho phôi",
        href: "/semi-finished-good/inventory-audit-list",
        requiredPrivileges: [...semiFinishedGoodGetPrivileges],
      },
    ],
  },

  /* =========================
     KHO THÀNH PHẨM
  ========================= */

  {
    id: "finished-good",
    name: "Kho thành phẩm",
    children: [
      {
        id: "fg-list",
        name: "Danh sách thành phẩm",
        href: "/finished-good/list",
        requiredPrivileges: [...finishedGoodGetPrivileges],
      },
      {
        id: "fg-daily-report",
        name: "Báo cáo thành phẩm",
        href: "/finished-good/daily-report",
        requiredPrivileges: [...finishedGoodGetPrivileges],
      },
      {
        id: "fg-audit",
        name: "Kiểm kê kho thành phẩm",
        href: "/finished-good/inventory-audit-list",
        requiredPrivileges: [...finishedGoodGetPrivileges],
      },
    ],
  },
]

function filterNodesByPrivileges(
  nodes: NodeWithPrivilege[],
  userPrivileges: AnyAccessPrivileges[],
): NodeWithPrivilege[] {
  return nodes
    .map((node) => {
      const hasPrivilege =
        !node.requiredPrivileges ||
        node.requiredPrivileges.length === 0 ||
        node.requiredPrivileges.some((p) => userPrivileges.includes(p));

      const filteredChildren = node.children
        ? filterNodesByPrivileges(node.children, userPrivileges)
        : undefined;

      // Keep node if:
      // - it has required privilege
      // - OR it has at least one visible child
      if (hasPrivilege || (filteredChildren && filteredChildren.length > 0)) {
        return {
          ...node,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter((node) => !check.null(node));
}

export const getAccessPrivilegeFilteredCollection = (accessPrivileges: AnyAccessPrivileges[]) => {
  const filteredTree = filterNodesByPrivileges(fullTree, accessPrivileges)

  const initialCollection = createTreeCollection<NodeWithPrivilege>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      href: "",
      children: filteredTree
    }
  });
  return initialCollection

}
