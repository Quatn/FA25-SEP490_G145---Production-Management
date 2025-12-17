"use client"

import { productionModuleConfigs } from "@/config/production-module.config";
import { Chart, useChart } from "@chakra-ui/charts"
import { Box, Center, DataList, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import check from "check-types";
import { useContext } from "react";
import { LuCheck } from "react-icons/lu";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, Tooltip, TooltipContentProps, XAxis, YAxis } from "recharts"
import { CreatePageStoreContext } from "../TabbedContainer";
import { useStore } from "@tanstack/react-store";

function CustomTooltip(props: Partial<TooltipContentProps<string, string>>) {
  const { active, payload, label } = props
  if (!active || !payload || payload.length === 0) return null
  const codes = props.payload?.at(0).payload.codes
  return (
    <Box rounded="sm" bg={"bg"} p={2}>
      <HStack>
        <Heading size="md">{label}</Heading>
      </HStack>
      <Stack>
        {check.array.of.string(codes) && (codes as unknown as string[]).map((code) => (
          <Text key={code}>{code}</Text>
        ))}
      </Stack>
      <Stack mt={2}>
        <DataList.Root orientation="horizontal">
          {payload.map((item) => (
            <DataList.Item key={item.name} justifyContent={"start"}>
                <Box boxSize="2" bg={item.color} />
              <DataList.ItemValue><Text>{(item.value as number).toFixed(2)} kg</Text></DataList.ItemValue>
            </DataList.Item>
          ))}
        </DataList.Root>
      </Stack>
    </Box>
  )
}

export type PaperUsageChartProps = {
  type: "FACE" | "RAW"
};

export default function PaperUsageChart(props: PaperUsageChartProps) {
  const store = useContext(CreatePageStoreContext);
  if (!store) throw new Error("Must be used inside CreatePageStoreContext");
  const paperUsageChartData = useStore(store, (s) => s.paperUsageChartData)

  const filteredPaperUsageChartData = {
    ...paperUsageChartData,
    series: paperUsageChartData.series.filter(s => check.equal(props.type === "RAW", s.name.split("/").length === 3))
  }

  const chart = useChart(filteredPaperUsageChartData)

  /*
  if (isFetchingList || moByTypeListIsFetchingList || paperrollsByTypeListIsFetchingList) {
    return <DataLoading />
  }

  if (fetchError || moByTypeListFetchError || paperrollsByTypeListFetchError) {
    return <DataFetchError refetch={refetchDraft} />
  }

  if (paperTypesList.length < 1) {
    return <DataEmpty />
  }
  */

  if (chart.data.length < 1) {
    return (
      <Center h={"full"}>
        <Stack alignItems={"center"}>
          <LuCheck size={"10rem"} color={"gray"} />
          <Text colorPalette={"gray"} color={"colorPalette.500"} >Không có lệnh nào dùng đến các loại giấy trên</Text>
        </Stack>
      </Center>

    )
  }

  return (
    <Chart.Root maxH="sm" chart={chart}>
      <LineChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis
          axisLine={false}
          dataKey={chart.key("manufacturingDate")}
          tickFormatter={(value) => value}
          stroke={chart.color("border")}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickMargin={10}
          stroke={chart.color("border")}
        />
        <Tooltip
          animationDuration={100}
          cursor={false}
          content={<CustomTooltip />}
        />
        <Legend content={<Chart.Legend interaction="hover" />} />
        <ReferenceLine
          y={productionModuleConfigs.DANGER_PAPER_TYPE_WEIGHT}
          stroke={chart.color("orange.fg")}
          strokeDasharray="5 5"
          ifOverflow="extendDomain"
          label={{
            value: "Mức cảnh báo",
            position: "top",
            fill: chart.color("orange.fg"),
            offset: 10,
          }}
        />
        <ReferenceArea
          y1={0}
          y2={1000}
          fill="rgba(255,125,0,0.1)"
          ifOverflow="extendDomain"
        />
        <ReferenceLine
          y={0}
          stroke={chart.color("red.fg")}
        />
        <ReferenceArea
          y2={0}
          fill="rgba(255,0,0,0.2)"
          ifOverflow="extendDomain"
        />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={2}
            fill={chart.color("bg")}
            opacity={chart.getSeriesOpacity(item.name)}
          />
        ))}
      </LineChart>
    </Chart.Root>
  )
}
