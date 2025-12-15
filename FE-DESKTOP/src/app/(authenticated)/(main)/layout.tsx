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
import { useMemo, useState } from "react";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "@/components/common/DataLoading";
import check from "check-types";
import { getAccessPrivilegeFilteredCollection } from "./sidebar-collection";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";

const SidebarNav = ({ accessPrivileges }: { accessPrivileges: AnyAccessPrivileges[] }) => {
  const initialCollection = useMemo(() => getAccessPrivilegeFilteredCollection(accessPrivileges), [accessPrivileges])
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
  )
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hydrating: boolean = useAppSelector((state) => {
    return state.auth.hydrating
  });
  const userState: UserState | null = useAppSelector((state) => {
    return state.auth.userState
  });

  if (hydrating) {
    return <DataLoading />
  }

  if (check.null(userState)) {
    <div />
  }

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
          <SidebarNav accessPrivileges={userState?.accessPrivileges ?? []} />
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
