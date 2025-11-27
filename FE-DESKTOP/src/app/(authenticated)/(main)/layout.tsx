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
            id: "purchase-order-create",
            name: "Purchase Order Create",
            href: "/purchase-order/create",
            children: [],
          },
        ],
      },

      {
        id: "manufacturing-order",
        name: "Manufacturing Order",
        children: [
          {
            id: "manufacturing-order-list",
            name: "Manufacturing Order List",
            href: "/manufacturing-order",
            children: [],
          },
          {
            id: "manufacturing-order-create",
            name: "Manufacturing Order Create",
            href: "/manufacturing-order/create",
            children: [],
          },
          {
            id: "manufacturing-order-tracking",
            name: "Manufacturing Order Tracking",
            href: "/manufacturing-order/tracking",
            children: [],
          },
          {
            id: "manufacturing-order-operate",
            name: "Manufacturing Order Operate",
            href: "/manufacturing-order/operate",
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
            href: "/paper-supplier",
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
            href: "/paper-color",
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
            href: "/paper-type",
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
            name: "Paper Roll",
            href: "/paper-list",
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
            href: "/ware-manufacturing-process-type",
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
            href: "/ware-finishing-process-type",
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
            href: "/flute-combination",
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
          {
            id: "semi-finished-good-daily-report",
            name: "Semi Finished Good Daily Report",
            href: "/semi-finished-good/daily-report",
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
          <Sidebar.Root>
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
