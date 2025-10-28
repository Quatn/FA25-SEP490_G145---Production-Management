"use client";

import { Box, Button, useTreeViewContext } from "@chakra-ui/react";
import { useMemo } from "react";

const cmp = (a: string[], b: string[]) => {
  return a.length == b.length;
};

export default function SidebarExpandCollapseButton() {
  const tree = useTreeViewContext();
  const isAllExpanded = useMemo(
    () => cmp(tree.expandedValue, tree.collection.getBranchValues()),
    [tree.expandedValue, tree.collection],
  );
  return (
    <Box>
      <Button
        aria-label="Expand all"
        size={"2xs"}
        colorPalette={"white"}
        onClick={() => tree.expand()}
        hidden={isAllExpanded}
      >
        Expand all
      </Button>
      <Button
        aria-label="Collapse all"
        size={"2xs"}
        colorPalette={"white"}
        onClick={() => tree.collapse()}
        hidden={!isAllExpanded}
      >
        Collapse all
      </Button>
    </Box>
  );
}
