import "./css/sidebar-scrollbar.css"
import type {
  FlexProps as ChakraFlexProps,
  TreeCollection,
  TreeViewExpandedChangeDetails,
  TreeViewRootProps,
} from "@chakra-ui/react";
import { Box, Flex, HStack, Text, TreeView } from "@chakra-ui/react";
import { ReactNode, RefObject } from "react";
import SidebarExpandCollapseButton from "./SidebarExpandCollapseButton";
import { SidebarTreeBranchNode, SidebarTreeLeafNode } from "./SidebarTreeNodes";

export interface Node {
  id: string;
  name: string;
  href?: string;
  children?: Node[];
}

export type SidebarTitleProps = {
  children?: ReactNode;
};

export type SidebarHeaderProps = {
  children?: ReactNode;
};

export type SidebarBodyProps = {
  children?: ReactNode;
};

export type SidebarFooterProps = {
  children?: ReactNode;
};

export type SidebarRootProps = ChakraFlexProps & {
  ref?: RefObject<HTMLDivElement>;
};

export type SidebarTreeProps = TreeViewRootProps & {
  collection: TreeCollection<Node>;
  expandedValue?: string[];
  onExpandedChange?: (details: TreeViewExpandedChangeDetails<Node>) => void;
  query?: string;
};

export const SidebarTitle = (props: SidebarTitleProps) => {
  return (
    <Text fontWeight="semibold" textStyle="lg">
      {props.children}
    </Text>
  );
};

export const SidebarHeader = (props: SidebarHeaderProps) => {
  return (
    <Flex flexWrap={"nowrap"} alignItems={"center"} gap={2} marginBottom={4}>
      {props.children}
    </Flex>
  );
};

export const SidebarBody = (props: SidebarBodyProps) => {
  return (
    <>
      <Box flexGrow={"1"} overflow={"auto"} className="sidebar-scrollbar">
        {props.children}
      </Box>
    </>
  );
};

export const SidebarFooter = (props: SidebarFooterProps) => {
  return (
    <>
      {props.children}
    </>
  );
};

export const SidebarRoot = (props: SidebarRootProps) => {
  return (
    <Flex
      p="4"
      borderWidth="1px"
      borderColor="border.disabled"
      borderRadius={0}
      flexDir={"column"}
      w={"full"}
      h={"full"}
      {...props}
      ref={props.ref}
    >
      {props.children}
    </Flex>
  );
};

export const SidebarTree = (props: SidebarTreeProps) => {
  return (
    <TreeView.Root
      maxW="md"
      {...props}
    >
      <HStack justifyContent={"space-between"}>
        <TreeView.Label fontWeight={"bold"}>Menu</TreeView.Label>
        <SidebarExpandCollapseButton />
      </HStack>
      <TreeView.Tree>
        <TreeView.Node
          indentGuide={<TreeView.BranchIndentGuide />}
          render={({ node, nodeState }) =>
            nodeState.isBranch
              ? (
                <SidebarTreeBranchNode node={node} nodeState={nodeState} query={props.query} />
              )
              : (
                <SidebarTreeLeafNode node={node} query={props.query} />
              )}
        />
      </TreeView.Tree>
    </TreeView.Root>
  );
};

export const Sidebar = {
  Root: SidebarRoot,
  Header: SidebarHeader,
  Body: SidebarBody,
  Footer: SidebarFooter,
  Title: SidebarTitle,
  Tree: SidebarTree,
};
