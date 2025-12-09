"use client";

import Header from "@/components/layout/Header";
import "./main.css";
import { Node, Sidebar } from "@/components/layout/Sidebar";
import {
  createTreeCollection,
  Flex,
  GridItem,
  Input,
  SimpleGrid,
  useFilter,
} from "@chakra-ui/react";
import { useState } from "react";
import NavBar from "@/components/layout/NavBar";

const initialCollection = createTreeCollection<Node>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    href: "",
    children: [
      {
        id: "dashboard",
        name: "Dashboard",
        href: "/dashboard",
        children: [],
      },
      {
        id: "customer",
        name: "Customer",
        children: [
          {
            id: "customer-list",
            name: "Customer List",
            href: "/customer/list",
            children: [],
          },
          {
            id: "customer-restore-list",
            name: "Customer Restore List",
            href: "/customer/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "purchase-order",
        name: "Purchase Order",
        children: [
          {
            id: "purchase-order-list",
            name: "Purchase Order List",
            href: "/purchase-order",
            children: [],
          },
          {
            id: "create-delivery-note",
            name: "Create Delivery Note",
            href: "/purchase-order/delivery-note-create",
            children: [],
          },
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
      },

      {
        id: "manufacturing-order",
        name: "Manufacturing Order",
        children: [
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
        ],
      },
      {
        id: "product",
        name: "Product Management",
        children: [
          {
            id: "product-list",
            name: "Product List",
            href: "/products",
            children: [],
          },
        ],
      },
      {
        id: "paper-supplier",
        name: "Paper Supplier",
        children: [
          {
            id: "paper-supplier-list",
            name: "Paper Supplier List",
            href: "/paper-supplier/list",
            children: [],
          },
          {
            id: "paper-supplier-restore-list",
            name: "Paper Supplier Restore List",
            href: "/paper-supplier/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "paper-color",
        name: "Paper Color",
        children: [
          {
            id: "paper-color-list",
            name: "Paper Color List",
            href: "/paper-color/list",
            children: [],
          },
          {
            id: "paper-color-restore-list",
            name: "Paper Color Restore List",
            href: "/paper-color/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "paper-type",
        name: "Paper Type",
        children: [
          {
            id: "paper-type-list",
            name: "Paper Type List",
            href: "/paper-type/list",
            children: [],
          },
          {
            id: "paper-type-restore-list",
            name: "Paper Type Restore List",
            href: "/paper-type/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "paper-roll",
        name: "Paper Roll",
        children: [
          {
            id: "paper-roll",
            name: "Paper List",
            href: "/paper-list",
            children: [],
          },
          {
            id: "paper-audit",
            name: "Paper Storage Audit",
            href: "/paper-list/audit-paper",
            children: [],
          },
          {
            id: "paper-restore",
            name: "Restore Paper Roll",
            href: "/paper-list/restore-paper",
            children: [],
          },
          {
            id: "paper-daily-report",
            name: "Paper Daily Usage Report",
            href: "/paper-list/daily-report",
            children: [],
          },
        ],
      },
      {
        id: "ware-manufacturing-process-type",
        name: "Ware Manufacturing Process Type",
        children: [
          {
            id: "ware-manufacturing-process-type-list",
            name: "Ware Manufacturing Process Type List",
            href: "/ware-manufacturing-process-type/list",
            children: [],
          },
          {
            id: "ware-manufacturing-process-type-restore-list",
            name: "Ware Manufacturing Process Type Restore List",
            href: "/ware-manufacturing-process-type/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "ware-finishing-process-type",
        name: "Ware Finishing Process Type",
        children: [
          {
            id: "ware-finishing-process-type-list",
            name: "Ware Finishing Process Type List",
            href: "/ware-finishing-process-type/list",
            children: [],
          },
          {
            id: "ware-finishing-process-type-restore-list",
            name: "Ware Finishing Process Type Restore List",
            href: "/ware-finishing-process-type/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "product-type",
        name: "Product Type",
        children: [
          {
            id: "product-type-list",
            name: "Product Type List",
            href: "/product-type",
            children: [],
          },
        ],
      },
      {
        id: "flute-combination",
        name: "Flute Combination",
        children: [
          {
            id: "flute-combination-list",
            name: "Flute Combination List",
            href: "/flute-combination/list",
            children: [],
          },
          {
            id: "flute-combination-restore-list",
            name: "Flute Combination Restore List",
            href: "/flute-combination/restore-list",
            children: [],
          },
        ],
      },
      {
        id: "semi-finished-good",
        name: "Semi Finished Good",
        children: [
          {
            id: "semi-finished-good-list",
            name: "Semi Finished Good List",
            href: "/semi-finished-good",
            children: [],
          },
        ],
      },
      {
        id: "finished-good",
        name: "Finished Good",
        children: [
          {
            id: "finished-good-list",
            name: "Finished Good List",
            href: "/finished-good",
            children: [],
          },
          {
            id: "finished-good-daily-report",
            name: "Finished Good Daily Report",
            href: "/finished-good/daily-report",
            children: [],
          },
        ],
      },
      {
        id: "ware",
        name: "Ware",
        children: [
          {
            id: "ware-list",
            name: "Ware List",
            href: "/ware",
            children: [],
          },
          {
            id: "ware-restore",
            name: "Restore Ware",
            href: "/ware/restore-ware",
            children: [],
          },
        ],
      },
    ],
  },
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collection, setCollection] = useState(initialCollection);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const { contains } = useFilter({ sensitivity: "base" });

  const search = (search: string) => {
    setQuery(search);
    const nextCollection = initialCollection.filter((node) =>
      contains(node.name, search)
    );
    setCollection(nextCollection);
    setExpanded(nextCollection.getBranchValues());
  };

  return (
    <Flex h={"full"} direction={"column"} grow={1}>
      <Header />
      <SimpleGrid
        columns={{ base: 1, sm: 5, md: 5 }}
        gap={{ base: "24px", md: "40px" }}
        overflowY={"hidden"}
        flexGrow={1}
      >
        <GridItem colSpan={{ base: 1, sm: 2, md: 1 }} overflowY={"auto"}>
          <Sidebar.Root
            colorPalette="blue"
            bg="colorPalette.subtle"
          >
            <Sidebar.Header>
              <Input
                size="sm"
                placeholder="Search page"
                onChange={(e) => search(e.target.value)}
                backgroundColor={"bg"}
              />
            </Sidebar.Header>

            <Sidebar.Body>
              <Sidebar.Tree
                collection={collection}
                expandedValue={expanded}
                onExpandedChange={(details) =>
                  setExpanded(details.expandedValue)
                }
                query={query}
              />
            </Sidebar.Body>
          </Sidebar.Root>
        </GridItem>
        <GridItem colSpan={{ base: 1, sm: 3, md: 4 }} overflowY={"auto"}>
          <main
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            {children}
          </main>
        </GridItem>
      </SimpleGrid>
      <footer></footer>
    </Flex>
  );
}
