"use client"

import { manufacturingOrderComponentUtils as moUtils } from "@/components/manufacturing-order/utils";
import { productionModuleConfigs } from "@/config/production-module.config";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import { UnpopulatedFieldError } from "@/lib/errors/UnpopulatedFieldError";
import { useGetAllByPaperTypesUsageQuery, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { useGetInventoryByWarePaperTypeCodesQuery } from "@/service/api/paperRollApiSlice";
import { formatDateToDDMMYYYY, formatDateToYYYYMMDD } from "@/utils/dateUtils";
import { Chart, useChart } from "@chakra-ui/charts"
import check from "check-types";
import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"

const DEFAULT_LINE_COLORS = [
  "teal.solid",
  "blue.solid",
  "green.solid",
  "orange.solid",
  "purple.solid",
  "red.solid",
]

export type PaperUsageChartProps = {
  type: "FACE" | "RAW"
};

export default function PaperUsageChart(props: PaperUsageChartProps) {
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
    return [...set].filter(p => !check.undefined(p) && !check.null(p) && check.equal(p.split("/").length, props.type === "FACE" ? 4 : 3)) as string[]
  }, [fullDetailMOsResponse?.data])

  const {
    data: paperrollsByTypeListResponse,
    error: paperrollsByTypeListFetchError,
    isLoading: paperrollsByTypeListIsFetchingList,
  } = useGetInventoryByWarePaperTypeCodesQuery({
    codes: paperTypesList,
  });

  const {
    data: moByTypeListResponse,
    error: moByTypeListFetchError,
    isLoading: moByTypeListIsFetchingList,
  } = useGetAllByPaperTypesUsageQuery({
    paperTypes: paperTypesList,
  });

  const paperUsageChartData = useMemo(() => {
    const arr: ({
      orderCode: string,
      manufacturingDate: Date,
      types: {
        type: string,
        weight: number,
      }[]
    })[] | undefined = moByTypeListResponse?.data?.map(mo => {
      const ware = moUtils.getPopulatedWare(mo)

      const types = ([
        {
          type: ware?.faceLayerPaperType, weight: parseFloat(mo.faceLayerPaperWeight + "")
        },
        {
          type: ware?.EFlutePaperType, weight: parseFloat(mo.EFlutePaperWeight + "")
        },
        {
          type: ware?.EBLinerLayerPaperType, weight: parseFloat(mo.EBLinerLayerPaperWeight + "")
        },
        {
          type: ware?.BFlutePaperType, weight: parseFloat(mo.BFlutePaperWeight + "")
        },
        {
          type: ware?.BACLinerLayerPaperType, weight: parseFloat(mo.BACLinerLayerPaperWeight + "")
        },
        {
          type: ware?.ACFlutePaperType, weight: parseFloat(mo.ACFlutePaperWeight + "")
        },
        {
          type: ware?.backLayerPaperType, weight: parseFloat(mo.backLayerPaperWeight + "")
        },
      ])

      return {
        orderCode: mo.code,
        manufacturingDate: new Date(mo.manufacturingDate),
        types: (types.filter(ty => check.string(ty.type) && check.number(ty.weight)) as { type: string, weight: number }[]),
      }
    })

    const sortedDataList = arr?.sort((mo1, mo2) => {
      return mo1.manufacturingDate.getTime() - mo2.manufacturingDate.getTime();
    })

    const accData: Record<string, string | number>[] = []

    if (sortedDataList?.length) {
      const init: Record<string, string | number> = {
        manufacturingDate: formatDateToDDMMYYYY(sortedDataList[0].manufacturingDate)
      }

      paperTypesList.forEach((typ) => {
        if (typ !== "manufacturingDate") {
          init[typ] = paperrollsByTypeListResponse?.data.find(pr => pr.code === typ)?.weight ?? 0
        }
      })

      accData.push(init)
    }

    sortedDataList?.forEach(mo => {
      const lastItem = accData.at(-1)
      if (lastItem) {
        if (lastItem["manufacturingDate"] === formatDateToDDMMYYYY(mo.manufacturingDate)) {
          mo.types.forEach((tp) => {
            if (check.number(lastItem[tp.type])) lastItem[tp.type] = (lastItem[tp.type] as number) - tp.weight
          })
        }
        else {
          const newItem = { ...lastItem }
          newItem["manufacturingDate"] = formatDateToDDMMYYYY(mo.manufacturingDate)
          mo.types.forEach((tp) => {
            if (check.number(newItem[tp.type])) newItem[tp.type] = (newItem[tp.type] as number) - tp.weight
          })
          accData.push(newItem)
        }
      }
    })

    return {
      data: accData,
      series: paperTypesList.map((s, index) => ({ name: s, color: DEFAULT_LINE_COLORS.at(index) })),
    }
  }, [moByTypeListResponse, paperrollsByTypeListResponse?.data, paperTypesList])

  const chart = useChart(paperUsageChartData)

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
          content={<Chart.Tooltip />}
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
