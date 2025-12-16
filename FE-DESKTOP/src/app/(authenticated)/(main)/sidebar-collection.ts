import { Node } from "@/components/layout/Sidebar";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import { createTreeCollection } from "@chakra-ui/react";
import check from "check-types";

interface SidebarNodeDef {
  privilegePrefix: string;
  parentNode?: Node,
  readNodes: Node[],
  readWriteNodes: Node[],
  adminNodes: Node[],
}

const DEFAULT_PAGES: SidebarNodeDef = {
  privilegePrefix: "",
  parentNode: {
    id: "dashboard",
    name: "Dashboard",
    href: "/dashboard",
    children: [],
  },
  readNodes: [],
  readWriteNodes: [],
  adminNodes: [],
}

const CUSTOMER_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "customer",
    name: "Quản lý khách hàng",
    children: [],
  },
  readNodes: [
    {
      id: "customer-list",
      name: "Danh sách khách hàng",
      href: "/customer/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "customer-restore-list",
      name: "Khôi phục khách hàng đã xóa",
      href: "/customer/restore-list",
      children: [],
    },
  ],
}

const PURCHASE_ORDER_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "purchase-order",
    name: "Quản lý đơn hàng (PO)",
    children: [],
  },
  readNodes: [
    {
      id: "purchase-order-list",
      name: "Danh sách PO",
      href: "/purchase-order",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "purchase-order-restore",
      name: "Khôi phục PO đã xóa",
      href: "/purchase-order/restore-po",
      children: [],
    },
    {
      id: "sub-purchase-order-restore",
      name: "Khôi phục Sub PO",
      href: "/purchase-order/restore-subpo",
      children: [],
    },
    {
      id: "purchase-order-item-restore",
      name: "Khôi phục PO Item",
      href: "/purchase-order/restore-item",
      children: [],
    },
  ],
}

const PRINT_COLOR_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "print-color",
    name: "Quản lý màu in",
    children: [],
  },
  readNodes: [
    {
      id: "print-color-list",
      name: "Danh sách màu in",
      href: "/print-color/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "print-color-restore-list",
      name: "Khôi phục màu in đã xóa",
      href: "/print-color/restore-list",
      children: [],
    },
  ],
}

const MANUFACTURING_ORDER_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "manufacturing-order",
    name: "Quản lý lệnh sản xuất",
    children: [],
  },
  readNodes: [
    {
      id: "manufacturing-order-dashboard",
      name: "Dashboard lệnh sản xuất",
      href: "/manufacturing-order",
      children: [],
    },
    {
      id: "manufacturing-order-list",
      name: "Danh sách lệnh sản xuất",
      href: "/manufacturing-order/list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "manufacturing-order-create",
      name: "Tạo lệnh sản xuất",
      href: "/manufacturing-order/create",
      children: [],
    },
    {
      id: "manufacturing-order-create",
      name: "Thao tác lệnh",
      href: "/manufacturing-order/create",
      children: [
        {
          id: "manufacturing-order-corrugator-process-operate",
          name: "Quy trình sóng",
          href: "/manufacturing-order/corrugator-process-operate",
          children: [],
        },
        {
          id: "order-finishing-process",
          name: "Quy trình hoàn thiện",
          href: "/order-finishing-process",
          children: [],
        },
      ],
    },
  ],
  adminNodes: [],
}

const PRODUCT_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "product",
    name: "Quản lý sản phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "product-list",
      name: "Danh sách sản phẩm",
      href: "/products",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "product-restore",
      name: "Khôi phục sản phẩm đã xóa",
      href: "/products/restore-product",
      children: [],
    },
  ],
}

const PAPER_COLOR_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "paper-color",
    name: "Quản lý màu giấy",
    children: [],
  },
  readNodes: [
    {
      id: "paper-color-list",
      name: "Danh sách màu giấy",
      href: "/paper-color/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-color-restore-list",
      name: "Khôi phục sản phẩm đã xóa",
      href: "/paper-color/restore-list",
      children: [],
    },
  ],
}

const PAPER_SUPPLIER_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "paper-supplier",
    name: "Quản lý nhà cung cấp giấy",
    children: [],
  },
  readNodes: [
    {
      id: "paper-supplier-list",
      name: "Danh sách nhà cung cấp giấy",
      href: "/paper-supplier/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-supplier-restore-list",
      name: "Khôi phục nhà cung cấp giấy đã xóa",
      href: "/paper-supplier/restore-list",
      children: [],
    },
  ],
}

const PAPER_TYPE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "paper-type",
    name: "Quản lý loại giấy",
    children: [],
  },
  readNodes: [
    {
      id: "paper-type-list",
      name: "Danh sách loại giấy",
      href: "/paper-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-type-restore-list",
      name: "Khôi phục loại giấy đã xóa",
      href: "/paper-type/restore-list",
      children: [],
    },
  ],
}

const PAPER_ROLL_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "paper-roll",
    name: "Quản lý kho giấy",
    children: [],
  },
  readNodes: [
    {
      id: "paper-roll",
      name: "Danh sách cuộn giấy",
      href: "/paper-list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "paper-audit",
      name: "Khiểm kê kho giấy",
      href: "/paper-list/audit-paper",
      children: [],
    },
    {
      id: "paper-daily-report",
      name: "Báo cáo sử dụng giấy",
      href: "/paper-list/daily-report",
      children: [],
    },
  ],
  adminNodes: [
    {
      id: "paper-restore",
      name: "Khôi phục cuộn giấy đã xóa",
      href: "/paper-list/restore-paper",
      children: [],
    },
  ],
}

const WARE_MANUFACTURING_PROCESS_TYPE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "ware-manufacturing-process-type",
    name: "Quản lý kiểu gia công sản phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "ware-manufacturing-process-type-list",
      name: "Danh sách kiểu gia công sản phẩm",
      href: "/ware-manufacturing-process-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-manufacturing-process-type-restore-list",
      name: "Khôi phục  kiểu gia công sản phẩm đã xóa",
      href: "/ware-manufacturing-process-type/restore-list",
      children: [],
    },
  ],
}

const WARE_FINISHING_PROCESS_TYPE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "ware-finishing-process-type",
    name: "Quản lý loại quy trình hoàn thiện sản phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "ware-finishing-process-type-list",
      name: "Danh sách loại quy trình hoàn thiện sản phẩm",
      href: "/ware-finishing-process-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-finishing-process-type-restore-list",
      name: "Khôi phục loại quy trình hoàn thiện sản phẩm đã xóa",
      href: "/ware-finishing-process-type/restore-list",
      children: [],
    },
  ],
}

const PRODUCT_TYPE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "product-type",
    name: "Quản lý loại sản phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "product-type-list",
      name: "Danh sách loại sản phẩm",
      href: "/product-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "product-type-restore-list",
      name: "Khôi phục loại sản phẩm đã xóa",
      href: "/product-type/restore-list",
      children: [],
    },
  ],
}

const FLUTE_COMBINATION_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "flute-combination",
    name: "Quản lý tổ hợp sóng",
    children: [],
  },
  readNodes: [
    {
      id: "flute-combination-list",
      name: "Danh sách tổ hợp sóng",
      href: "/flute-combination/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "flute-combination-restore-list",
      name: "Khôi phục tổ hợp sóng đã xóa",
      href: "/flute-combination/restore-list",
      children: [],
    },
  ],
}

const SEMI_FINISHED_GOOD_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "semi-finished-good",
    name: "Kho bán thành phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "semi-finished-good-dashboard",
      name: "Dashboard kho bán thành phẩm",
      href: "/semi-finished-good/dashboard",
      children: [],
    },
    {
      id: "semi-finished-good-list",
      name: "Danh sách bán thành phẩm",
      href: "/semi-finished-good/list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "semi-finished-good-inventory-audit-list",
      name: "Kiểm kê kho bán thành phẩm",
      href: "/semi-finished-good/inventory-audit-list",
      children: [],
    },
  ],
  adminNodes: [],
}

const FINISHED_GOOD_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "warehouse",
  parentNode: {
    id: "finished-good",
    name: "Kho thành phẩm",
    children: [],
  },
  readNodes: [
    {
      id: "finished-good-list",
      name: "Danh sách thành phẩm",
      href: "/finished-good/list",
      children: [],
    },
    {
      id: "finished-good-daily-report",
      name: "Báo cáo kho thành phẩm",
      href: "/finished-good/daily-report",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "finished-good-inventory-audit-list",
      name: "Kiểm kê kho thành phẩm",
      href: "/finished-good/inventory-audit-list",
      children: [],
    },
  ],
  adminNodes: [],
}

const WARE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "ware",
    name: "Quản lý mã hàng",
    children: [],
  },
  readNodes: [
    {
      id: "ware-list",
      name: "Danh sách mã hàng",
      href: "/ware",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-restore",
      name: "Khôi phục mã hàng đã xóa",
      href: "/ware/restore-ware",
      children: [],
    },
  ],
}

const productionModulePages: SidebarNodeDef[] = [
  CUSTOMER_PAGES,
  FLUTE_COMBINATION_PAGES,
  MANUFACTURING_ORDER_PAGES,
  PRINT_COLOR_PAGES,
  PRODUCT_PAGES,
  PRODUCT_TYPE_PAGES,
  PURCHASE_ORDER_PAGES,
  WARE_PAGES,
  WARE_FINISHING_PROCESS_TYPE_PAGES,
  WARE_MANUFACTURING_PROCESS_TYPE_PAGES,
]

const warehouseModulePages: SidebarNodeDef[] = [
  FINISHED_GOOD_PAGES,
  PAPER_COLOR_PAGES,
  PAPER_ROLL_PAGES,
  PAPER_SUPPLIER_PAGES,
  SEMI_FINISHED_GOOD_PAGES,
  PAPER_TYPE_PAGES,
]

const sidebarNodeDefToNodes = (def: SidebarNodeDef): Node[] => {
  if (def.parentNode) {
    return [{ ...def.parentNode, children: [...(def.parentNode.children ?? []), ...def.readNodes, ...def.readWriteNodes, ...def.adminNodes] }]
  }
  else return [...def.readNodes, ...def.readWriteNodes, ...def.adminNodes]
}

export const getAccessPrivilegeFilteredCollection = (accessPrivileges: AnyAccessPrivileges[]) => {
  const accNodes: Node[] = sidebarNodeDefToNodes(DEFAULT_PAGES)

  if (accessPrivileges.length > 0) {
    const systemAdminPriv = accessPrivileges.includes("system-admin")
    const systemReadWritePriv = systemAdminPriv || accessPrivileges.includes("system-readWrite")
    const systemReadPriv = systemAdminPriv || systemReadWritePriv || accessPrivileges.includes("system-read")

    for (const def of [...productionModulePages, ...warehouseModulePages]) {
      const innerAccNodes: Node[] = []

      const adminPriv = systemAdminPriv || accessPrivileges.includes(def.privilegePrefix + "-readWrite" as AnyAccessPrivileges)
      const readWritePriv = systemReadWritePriv || adminPriv || accessPrivileges.includes(def.privilegePrefix + "-readWrite" as AnyAccessPrivileges)
      const readPriv = systemReadPriv || adminPriv || readWritePriv || accessPrivileges.includes(def.privilegePrefix + "-read" as AnyAccessPrivileges)

      if (readPriv) {
        innerAccNodes.push(...def.readNodes)
      }

      if (readWritePriv) {
        innerAccNodes.push(...def.readWriteNodes)
      }

      if (adminPriv) {
        innerAccNodes.push(...def.adminNodes)
      }

      if (def.parentNode && (innerAccNodes.length > 0 || check.string(def.parentNode.href))) {
        accNodes.push({ ...def.parentNode, children: [...(def.parentNode.children ?? []), ...innerAccNodes] })
      }
      else {
        accNodes.push(...innerAccNodes)
      }
    }
  }

  const initialCollection = createTreeCollection<Node>({
    nodeToValue: (node) => node.id,
    nodeToString: (node) => node.name,
    rootNode: {
      id: "ROOT",
      name: "",
      href: "",
      children: accNodes
    }
  })

  return initialCollection
}
