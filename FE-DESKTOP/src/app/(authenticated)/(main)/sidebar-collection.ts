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
    name: "Customer",
    children: [],
  },
  readNodes: [
    {
      id: "customer-list",
      name: "Customer List",
      href: "/customer/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "customer-restore-list",
      name: "Customer Restore List",
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
    name: "Purchase Order",
    children: [],
  },
  readNodes: [
    {
      id: "purchase-order-list",
      name: "Purchase Order List",
      href: "/purchase-order",
      children: [],
    },
    {
      id: "delivery-note-list",
      name: "Delivery Note List",
      href: "/purchase-order/delivery-note-list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "create-delivery-note",
      name: "Create Delivery Note",
      href: "/purchase-order/delivery-note-create",
      children: [],
    },
  ],
  adminNodes: [
    {
      id: "purchase-order-restore",
      name: "Restore Purchase Order",
      href: "/purchase-order/restore-po",
      children: [],
    },
    {
      id: "sub-purchase-order-restore",
      name: "Restore Sub PO (Product)",
      href: "/purchase-order/restore-subpo",
      children: [],
    },
    {
      id: "purchase-order-item-restore",
      name: "Restore PO Item",
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
    name: "Print Color",
    children: [],
  },
  readNodes: [
    {
      id: "print-color-list",
      name: "Print Color List",
      href: "/print-color/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "print-color-restore-list",
      name: "Print Color Restore List",
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
    name: "Manufacturing Order",
    children: [],
  },
  readNodes: [
    {
      id: "manufacturing-order-dashboard",
      name: "Manufacturing Order Dashboard",
      href: "/manufacturing-order",
      children: [],
    },
    {
      id: "manufacturing-order-list",
      name: "Manufacturing Order List",
      href: "/manufacturing-order/list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "manufacturing-order-create",
      name: "Manufacturing Order Create",
      href: "/manufacturing-order/create",
      children: [],
    },
    {
      id: "manufacturing-order-corrugator-process-operate",
      name: "Manufacturing Order Corrugator Process Operate",
      href: "/manufacturing-order/corrugator-process-operate",
      children: [],
    },
    {
      id: "order-finishing-process",
      name: "Order Finishing Process",
      href: "/order-finishing-process",
      children: [],
    },
  ],
  adminNodes: [],
}

const PRODUCT_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "production",
  parentNode: {
    id: "product",
    name: "Product Management",
    children: [],
  },
  readNodes: [
    {
      id: "product-list",
      name: "Product List",
      href: "/products",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "product-restore",
      name: "Restore Product",
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
    name: "Paper Color",
    children: [],
  },
  readNodes: [
    {
      id: "paper-color-list",
      name: "Paper Color List",
      href: "/paper-color/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-color-restore-list",
      name: "Paper Color Restore List",
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
    name: "Paper Supplier",
    children: [],
  },
  readNodes: [
    {
      id: "paper-supplier-list",
      name: "Paper Supplier List",
      href: "/paper-supplier/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-supplier-restore-list",
      name: "Paper Supplier Restore List",
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
    name: "Paper Type",
    children: [],
  },
  readNodes: [
    {
      id: "paper-type-list",
      name: "Paper Type List",
      href: "/paper-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "paper-type-restore-list",
      name: "Paper Type Restore List",
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
    name: "Paper Roll",
    children: [],
  },
  readNodes: [
    {
      id: "paper-roll",
      name: "Paper List",
      href: "/paper-list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "paper-audit",
      name: "Paper Storage Audit",
      href: "/paper-list/audit-paper",
      children: [],
    },
    {
      id: "paper-daily-report",
      name: "Paper Daily Usage Report",
      href: "/paper-list/daily-report",
      children: [],
    },
  ],
  adminNodes: [
    {
      id: "paper-restore",
      name: "Restore Paper Roll",
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
    name: "Ware Manufacturing Process Type",
    children: [],
  },
  readNodes: [
    {
      id: "ware-manufacturing-process-type-list",
      name: "Ware Manufacturing Process Type List",
      href: "/ware-manufacturing-process-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-manufacturing-process-type-restore-list",
      name: "Ware Manufacturing Process Type Restore List",
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
    name: "Ware Finishing Process Type",
    children: [],
  },
  readNodes: [
    {
      id: "ware-finishing-process-type-list",
      name: "Ware Finishing Process Type List",
      href: "/ware-finishing-process-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-finishing-process-type-restore-list",
      name: "Ware Finishing Process Type Restore List",
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
    name: "Product Type",
    children: [],
  },
  readNodes: [
    {
      id: "product-type-list",
      name: "Product Type List",
      href: "/product-type/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "product-type-restore-list",
      name: "Product Type Restore List",
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
    name: "Flute Combination",
    children: [],
  },
  readNodes: [
    {
      id: "flute-combination-list",
      name: "Flute Combination List",
      href: "/flute-combination/list",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "flute-combination-restore-list",
      name: "Flute Combination Restore List",
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
    name: "Semi Finished Good",
    children: [],
  },
  readNodes: [
    {
      id: "semi-finished-good-dashboard",
      name: "Semi Finished Good Dashboard",
      href: "/semi-finished-good/dashboard",
      children: [],
    },
    {
      id: "semi-finished-good-list",
      name: "Semi Finished Good List",
      href: "/semi-finished-good/list",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "semi-finished-good-inventory-audit-list",
      name: "Semi Finished Good Inventory Audit List",
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
    name: "Finished Good",
    children: [],
  },
  readNodes: [
    {
      id: "finished-good-list",
      name: "Finished Good List",
      href: "/finished-good/list",
      children: [],
    },
    {
      id: "finished-good-daily-report",
      name: "Finished Good Daily Report",
      href: "/finished-good/daily-report",
      children: [],
    },
  ],
  readWriteNodes: [
    {
      id: "finished-good-inventory-audit-list",
      name: "Finished Good Inventory Audit List",
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
    name: "Ware",
    children: [],
  },
  readNodes: [
    {
      id: "ware-list",
      name: "Ware List",
      href: "/ware",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "ware-restore",
      name: "Restore Ware",
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
