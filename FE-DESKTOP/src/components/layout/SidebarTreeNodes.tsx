"use client"

import { Highlight, Text, TreeView } from "@chakra-ui/react"
import { LuChevronRight } from "react-icons/lu"
import { Node } from "./Sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const SidebarTreeBranchNode = (props: {
  query?: string,
  node: Node,
  nodeState: TreeView.NodeState
}) => {
  return (
    <TreeView.BranchControl>
      <TreeView.BranchTrigger>
        <TreeView.BranchIndicator asChild>
          <LuChevronRight />
        </TreeView.BranchIndicator>
      </TreeView.BranchTrigger>
      <TreeView.BranchText>
        {props.query
          ? (
            <Text>
              <Highlight
                ignoreCase
                query={[props.query]}
                styles={{ colorPalette: "orange", color: "colorPalette.500" }}
              >
                {props.node.name}
              </Highlight>
            </Text>
          )
          : props.node.name}
      </TreeView.BranchText>
    </TreeView.BranchControl>
  )
}

export const SidebarTreeLeafNode = (props: {
  query?: string,
  node: Node,
}
) => {
  const pathname = usePathname();

  if (!props.node.href) {
    return (
      <TreeView.Item asChild>
        <TreeView.ItemText>
          {props.query
            ? (
              <Text>
                <Highlight
                  ignoreCase
                  query={[props.query]}
                  styles={{ colorPalette: "orange", color: "colorPalette.500" }}
                >
                  {props.node.name}
                </Highlight>
              </Text>
            )
            : props.node.name}
        </TreeView.ItemText>
      </TreeView.Item>
    )
  }

  if (props.node.href && props.node.href === pathname) {
    return (
      <TreeView.Item asChild>
        <TreeView.ItemText bgColor={"colorPalette.emphasized"}>
          {props.query
            ? (
              <Text>
                <Highlight
                  ignoreCase
                  query={[props.query]}
                  styles={{ bg: "colorPalette.emphasized", color: "yellow.emphasized" }}
                >
                  {props.node.name}
                </Highlight>
              </Text>
            )
            : props.node.name}
        </TreeView.ItemText>
      </TreeView.Item>
    )
  }

  return (
    <TreeView.Item asChild>
      <Link href={props.node.href}>
        <TreeView.ItemText>
          {props.query
            ? (
              <Text>
                <Highlight
                  ignoreCase
                  query={[props.query]}
                  styles={{ bg: "colorPalette.emphasized" }}
                >
                  {props.node.name}
                </Highlight>
              </Text>
            )
            : props.node.name}
        </TreeView.ItemText>
      </Link>
    </TreeView.Item>
  )

}
