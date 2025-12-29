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
  readNodes: [],
  readWriteNodes: [],
  adminNodes: [],
}

const USER_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "user",
  readNodes: [
    {
      id: "user",
      name: "Quản lý người dùng",
      href: "/user",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [],
}

const EMPLOYEE_PAGES: SidebarNodeDef = {
  // TODO: Change this to a more specific prefix
  privilegePrefix: "employee",
  parentNode: {
    id: "employee",
    name: "Quản lý nhân viên",
    children: [],
  },
  readNodes: [
    {
      id: "employee-list",
      name: "Danh sách nhân viên",
      href: "/employee",
      children: [],
    },
  ],
  readWriteNodes: [],
  adminNodes: [
    {
      id: "employee-restore",
      name: "Khôi khục nhân viên đã xóa",
      href: "/employee/restore-employee",
      children: [],
    },
  ],
}

const userModulePages: SidebarNodeDef[] = [
  USER_PAGES,
]

const employeeModulePages: SidebarNodeDef[] = [
  EMPLOYEE_PAGES,
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

    for (const def of [...userModulePages, ...employeeModulePages]) {
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
