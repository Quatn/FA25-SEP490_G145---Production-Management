"use client";

import "./admin.css";
import Header from "@/components/layout/Header";
import InsufficientPrivilegeErrorWarning from "@/components/layout/InsufficientPrivilegeErrorWarning";
import PrivilegedContent from "@/components/layout/PrivilegedContent";
import { Node, Sidebar } from "@/components/layout/Sidebar";
import { AnyAccessPrivileges } from "@/types/AccessPrivileges";
import {
  Box,
  Center,
  createTreeCollection,
  Flex,
  GridItem,
  Input,
  InputGroup,
  SimpleGrid,
  Spinner,
  useFilter,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { getAccessPrivilegeFilteredCollection } from "./sidebar-collection";
import { useAppSelector } from "@/service/hooks";
import { UserState } from "@/types/UserState";
import DataLoading from "@/components/common/DataLoading";
import check from "check-types";
import { LuSearch } from "react-icons/lu";

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
        ],
      },
      {
        id: "employee",
        name: "Employee Management",
        children: [
          {
            id: "employee-list",
            name: "Employee List",
            href: "/employee",
            children: [],
          },
          {
            id: "employee-restore",
            name: "Restore Employee",
            href: "/employee/restore-employee",
            children: [],
          },
        ],
      },
    ],
  },
});

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
      colorPalette="black"
      bg="colorPalette.muted"
    >
      <Sidebar.Header>
        <InputGroup startElement={<LuSearch />}>
          <Input
            size="sm"
            placeholder="Tìm trang"
            onChange={(e) => search(e.target.value)}
            backgroundColor={"bg"}
          />
        </InputGroup>
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

export default function AdminLayout({
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
    <PrivilegedContent
      requiredPrivileges={["system-admin", "system-read", "system-readWrite", "employee-admin", "employee-read", "employee-readWrite", "user-admin", "user-read", "user-readWrite"]}
      loading={
        <Box
          w={"100vw"}
          h={"100vh"}
          colorPalette={"gray"}
          bg={"colorPalette.subtle"}
        >
          <Center h="full">
            <Spinner />
          </Center>
        </Box>
      }
      unauthenticatedContent={<InsufficientPrivilegeErrorWarning
        w={"100vw"}
        h={"100vh"}
        colorPalette={"gray"}
        bg={"colorPalette.subtle"}
      />}
    >
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
    </PrivilegedContent >
  );
}
