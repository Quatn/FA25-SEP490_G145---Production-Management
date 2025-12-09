"use client"

import { manufacturingOrderComponentUtils as moUtils } from "@/components/manufacturing-order/utils";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetAllByPaperTypesUsageQuery, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { Chart, useChart } from "@chakra-ui/charts"
import check from "check-types";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts"


export default function PaperUsageChart() {
  const { useSelector } = ManufacturingOrderCreatePageReducerStore;
  const selectedPOIsIds = useSelector(s => s.selectedPOIsIds);

  const {
    data: fullDetailMOsResponse,
    error: fetchError,
    isLoading: isFetchingList,
  } = useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery({
    ids: selectedPOIsIds,
  });

  const paperTypesList = useMemo(() => {
    const arr = fullDetailMOsResponse?.data?.map(mo => {
      const ware = moUtils.getPopulatedWare(mo)

      return [ware?.faceLayerPaperType, ware?.EFlutePaperType, ware?.EBLinerLayerPaperType, ware?.BFlutePaperType, ware?.BACLinerLayerPaperType, ware?.ACFlutePaperType, ware?.backLayerPaperType]
    })

    const set = new Set(arr?.flat())
    return [...set].filter(p => !check.undefined(p) && !check.null(p))
  }, [fullDetailMOsResponse?.data])

  const {
    data: moByTypeListResponse,
    error: moByTypeListFetchError,
    isLoading: moByTypeListIsFetchingList,
  } = useGetAllByPaperTypesUsageQuery({
    paperTypes: paperTypesList,
  });

  const paperUsageChartData = useMemo(() => {
    const arr = fullDetailMOsResponse?.data?.map(mo => {
      const ware = moUtils.getPopulatedWare(mo)

      return {
        orderCode: mo.code,
        manufacturingDate: new Date(mo.manufacturingDate),
        types: [
          {
            type: ware?.faceLayerPaperType, weight: mo.faceLayerPaperWeight
          },
          {
            type: ware?.EFlutePaperType, weight: mo.EFlutePaperWeight
          },
          {
            type: ware?.EBLinerLayerPaperType, weight: mo.EBLinerLayerPaperWeight
          },
          {
            type: ware?.BFlutePaperType, weight: mo.BFlutePaperWeight
          },
          {
            type: ware?.BACLinerLayerPaperType, weight: mo.BACLinerLayerPaperWeight
          },
          {
            type: ware?.ACFlutePaperType, weight: mo.ACFlutePaperWeight
          },
          {
            type: ware?.backLayerPaperType, weight: mo.backLayerPaperWeight
          },
        ]
      }
    })

    return arr?.sort((mo1, mo2) => {
      return mo1.manufacturingDate.getTime() - mo2.manufacturingDate.getTime();
    })


  }, [fullDetailMOsResponse?.data])

  const chart = useChart({
    data: [
      { sale: 10, month: "January" },
      { sale: 95, month: "February" },
      { sale: 87, month: "March" },
      { sale: 88, month: "May" },
      { sale: 65, month: "June" },
      { sale: 90, month: "August" },
    ],
    series: [{ name: "sale", color: "teal.solid" }],
  })

  return (
    <Chart.Root maxH="sm" chart={chart}>
      <LineChart data={chart.data}>
        <CartesianGrid stroke={chart.color("border")} vertical={false} />
        <XAxis
          axisLine={false}
          dataKey={chart.key("month")}
          tickFormatter={(value) => value.slice(0, 3)}
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
          content={<Chart.Tooltip />}
        />
        {chart.series.map((item) => (
          <Line
            key={item.name}
            isAnimationActive={false}
            dataKey={chart.key(item.name)}
            stroke={chart.color(item.color)}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </Chart.Root>
  )
}
