"use client";

import React from "react";
import {
  Box,
  HStack,
  VStack,
  Text,
  Spinner,
  Center,
  Link as ChakraLink,
  Square,
} from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  LabelList,
} from "recharts";
import { useGetPurchaseOrdersQuery } from "@/service/api/purchaseOrderApiSlice";

/** small local chart helper (keeps your original code shape) */
function useLocalChart(opts: {
  data: Array<{ name: string; value: number; color?: string }>;
}) {
  const data = opts.data || [];
  return {
    data,
    key: (k: string) => k,
    color: (token?: string) => {
      const map: Record<string, string> = {
        "yellow.solid": "#D69E2E",
        "green.solid": "#38A169",
        "blue.solid": "#3182CE",
        "red.solid": "#E53E3E",
      };
      if (!token) return "#CBD5E0";
      return map[token] ?? token;
    },
  };
}

const PO_UNFINISHED_LABEL = "CHƯA HOÀN THÀNH";
const PO_FINISHED_LABEL = "ĐÃ HOÀN THÀNH";

export default function POPieChart(): JSX.Element {
  // --- data ---
  const { data, isLoading, isError } = useGetPurchaseOrdersQuery({
    page: 1,
    limit: 1000,
    search: "",
  });

  const items: any[] = React.useMemo(() => {
    if (!data) return [];
    if ((data as any).data && Array.isArray((data as any).data.data))
      return (data as any).data.data;
    if ((data as any).data && Array.isArray((data as any).data))
      return (data as any).data;
    if (Array.isArray(data)) return data as any[];
    return [];
  }, [data]);

  const counts = React.useMemo(() => {
    const total = items.length;
    let finished = 0;
    for (const it of items) {
      const status = (it?.status || "").toString().toUpperCase();
      if (status === "COMPLETED") finished += 1;
    }
    const unfinished = total - finished;
    return { total, finished, unfinished };
  }, [items]);

  // --- chart ---
  const chart = useLocalChart({
    data: [
      {
        name: PO_UNFINISHED_LABEL,
        value: counts.unfinished,
        color: "yellow.solid",
      },
      { name: PO_FINISHED_LABEL, value: counts.finished, color: "green.solid" },
    ],
  });

  const iconColor = "gray.600";

  // sizing values (as you requested)
  const CARD_HEIGHT_PX = 321;
  const PIE_AREA_PX = 260;
  const OUTER_RADIUS = Math.floor(PIE_AREA_PX / 2) - 6;

  const PIE_OFFSET_PX = 100;

  return (
    <Box p={2} rounded="sm" position="relative" height={`${CARD_HEIGHT_PX}px`}>
      <Box position="absolute" top={6} right={6} zIndex={2}>
        <ChakraLink
          href="/purchase-order"
          aria-label="Open purchase order list"
          title="Open purchase order list"
          _hover={{ textDecoration: "none" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 6,
              borderRadius: 6,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: iconColor,
              fontSize: 16,
              lineHeight: 0,
            }}
          >
            <FiExternalLink />
          </span>
        </ChakraLink>
      </Box>

      {isLoading ? (
        <Center py={8} h="100%">
          <Spinner />
        </Center>
      ) : isError ? (
        <Center py={8} h="100%">
          <Text color="red.500">Không thể tải dữ liệu đơn hàng</Text>
        </Center>
      ) : (
        // make HStack match the card height so contents are vertically centered
        <HStack
          spacing={6}
          alignItems="center"
          justifyContent="space-between"
          h="100%"
        >
          {/* Pie area sized to PIE_AREA_PX; ml moves it to the right */}
          <Box
            width={`${PIE_AREA_PX}px`}
            height={`${PIE_AREA_PX}px`}
            ml={`${PIE_OFFSET_PX}px`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RechartsTooltip cursor={false} animationDuration={100} />
                <Pie
                  isAnimationActive={false}
                  data={chart.data}
                  dataKey={chart.key("value")}
                  outerRadius={OUTER_RADIUS}
                >
                  <LabelList position="inside" fill="black" stroke="none" />
                  {chart.data.map((item) => (
                    <Cell key={item.name} fill={chart.color(item.color)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Legend / counts: vertically centered because HStack has full height */}
          <VStack alignItems="flex-start" spacing={4}>
            {chart.data.map((d) => (
              <HStack key={d.name}>
                <Square
                  size="14px"
                  borderRadius="2px"
                  bg={chart.color(d.color)}
                />
                <VStack alignItems="flex-start" spacing={0}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {d.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {d.value} đơn
                  </Text>
                </VStack>
              </HStack>
            ))}
          </VStack>
        </HStack>
      )}
    </Box>
  );
}
