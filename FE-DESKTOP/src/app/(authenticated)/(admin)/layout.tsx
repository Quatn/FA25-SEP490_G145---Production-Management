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
        id: "admin-dashboard",
        name: "Admin Dashboard",
        href: "/admin-dashboard",
        children: [],
      },
      {
        id: "user",
        name: "User Management",
        children: [
          {
            id: "user-list",
            name: "User List",
            href: "/user",
            children: [],
          },
          {
            id: "user-create",
            name: "User Create",
            href: "/user/create",
            children: [],
          },
        ],
      },
    ],
  },
});

export default function AdminLayout({
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
                backgroundColor={"white"}
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
                rootProps={{
                  colorPalette: "gray",
                }}
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
