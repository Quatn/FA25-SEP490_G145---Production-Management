import { Box, Button, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import ManufacturingOrderTrackPanelList from "./List";
import ManufacturingOrderTrackPanelPagination from "./Pagination";
import ManufacturingOrderTrackPanelSearchBar from "./SearchBar";

export type ManufacturingOrderTrackPanelProps = {
}

export default function ManufacturingOrderTrackPanelBox(_props: ManufacturingOrderTrackPanelProps) {
  return (
    <Box
      m={5}
      p={2}
      flexGrow={1}
    >
      <Box
        px={3}
        py={5}
        rounded={"md"}
        colorPalette={"gray"}
        backgroundColor={"colorPalette.subtle"}
      >
        <Stack
          gapY={2}
          minHeight={"80vh"}
        >
          <HStack justifyContent={"space-between"} alignItems={"start"}>
            <Heading size={"lg"}>
              Quản lý lệnh
            </Heading>

            <Link href="/manufacturing-order/list">
              <Button size={"sm"} colorPalette={"cyan"}>Xem danh sách chi tiết</Button>
            </Link>
          </HStack>

          <ManufacturingOrderTrackPanelSearchBar />

          <Box flexGrow={1}>
            <ManufacturingOrderTrackPanelList />
          </Box>

          <ManufacturingOrderTrackPanelPagination />

        </Stack>
      </Box>
    </Box>
  )
}
