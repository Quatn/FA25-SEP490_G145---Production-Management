"use client";

import { Box, Button, Center, Group, HStack, Stack, Tabs, Text } from "@chakra-ui/react";
import { LuFolder, LuSquareCheck, LuUser } from "react-icons/lu";
import CreatePageManufacturingOrderTable from "./details-table-tab/Table";
import MaterialRequirementContainer from "./material-requirement-summary-tab/Container";
import { useGetAllByPaperTypesUsageQuery, useGetDraftFullDetailManufacturingOrdersByPoiIdsQuery } from "@/service/api/manufacturingOrderApiSlice";
import { FullDetailManufacturingOrderDTO } from "@/types/DTO/FullDetailManufactureOrder";
import React, { createContext, Dispatch, useContext, useEffect, useMemo, useReducer } from "react";
import { ManufacturingOrder } from "@/types/ManufacturingOrder";
import { ManufacturingOrderCreatePageReducerStore } from "@/context/manufacturing-order/manufacturingOrderCreatePageContext";
import DataLoading from "@/components/common/DataLoading";
import DataFetchError from "@/components/common/DataFetchError";
import check from "check-types";
import { Store } from "@tanstack/react-store";
import { manufacturingOrderComponentUtils as moUtils } from "@/components/manufacturing-order/utils";
import { useGetInventoryByWarePaperTypeCodesQuery } from "@/service/api/paperRollApiSlice";
import { formatDateToDDMMYYYY } from "@/utils/dateUtils";
import { MaterialRequirementDto } from "@/types/DTO/material-requirement-summary/MaterialRequirement";
import { PurchaseOrderItem } from "@/types/PurchaseOrderItem";
import { Ware } from "@/types/Ware";

const DEFAULT_LINE_COLORS = [
  "teal.solid",
  "blue.solid",
  "green.solid",
  "orange.solid",
  "purple.solid",
  "red.solid",
]

export type CreatePageState = {
  draftedMOs?: Serialized<ManufacturingOrder>[]
  facePaperUsage: MaterialRequirementDto[],
  rawPaperUsage: MaterialRequirementDto[],
  paperUsageChartData: {
    data: Record<string, string | number | string[]>[],
    series: {
      name: string,
      color: string | undefined
    }[]
  },
}

function accumulateMaterialRequirements(
  items: Serialized<ManufacturingOrder>[] | undefined,
  type?: "FACE" | "RAW",
  inventory?: {
    code: string,
    weight: number,
  }[],
): MaterialRequirementDto[] {
  if (check.undefined(items)) return []

  const requirementMap: Map<string, number> = new Map();

  const pois = items
    .filter(mo => check.nonEmptyObject(mo.purchaseOrderItem))
    .filter(poi => check.nonEmptyObject((poi.purchaseOrderItem as Serialized<PurchaseOrderItem>).ware))
    .map(mo => mo.purchaseOrderItem as Serialized<PurchaseOrderItem>)
  const wares = pois.map(poi => poi.ware)

  if (check.undefined(pois) || check.undefined(wares)) return []

  // List of all paper type and weight field pairs
  const fields: { type: keyof Ware; weight: keyof PurchaseOrderItem }[] = [
    { type: "faceLayerPaperType", weight: "faceLayerPaperWeight" },
    { type: "EFlutePaperType", weight: "EFlutePaperWeight" },
    { type: "EBLinerLayerPaperType", weight: "EBLinerLayerPaperWeight" },
    { type: "BFlutePaperType", weight: "BFlutePaperWeight" },
    { type: "BACLinerLayerPaperType", weight: "BACLinerLayerPaperWeight" },
    { type: "ACFlutePaperType", weight: "ACFlutePaperWeight" },
    { type: "backLayerPaperType", weight: "backLayerPaperWeight" },
  ];

  for (const poi of pois) {
    for (const pair of fields) {
      const code = (poi.ware as Serialized<Ware>)[pair.type] as string;
      const weight = poi[pair.weight];

      if (code && check.equal(code.split("/").length === 4, type === "FACE") && typeof weight === "number") {
        const current = requirementMap.get(code) || 0;
        requirementMap.set(code, current + weight);
      }
    }
  }

  // Convert map to array of MaterialRequirementDto
  const result: MaterialRequirementDto[] = [];
  for (const [code, requirementWeight] of requirementMap) {
    const inventoryWeight = inventory?.find(roll => roll.code == code)?.weight ?? 0
    result.push({
      code,
      requirementWeight,
      inventoryWeight,
      status: (requirementWeight > inventoryWeight) ? `Thiếu ${(requirementWeight - inventoryWeight).toFixed(4)} kg` : "Đủ",  // Set a default status or update as needed
    });
  }

  return result;
}

function compileChartData(
  moByTypeList?: Serialized<ManufacturingOrder>[],
  paperTypesList?: string[],
  inventory?: {
    code: string,
    weight: number,
  }[],
) {
  const arr: ({
    orderCode: string,
    manufacturingDate: Date,
    types: {
      type: string,
      weight: number,
    }[]
  })[] | undefined = moByTypeList?.map(mo => {
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

  const accData: Record<string, string | number | string[]>[] = []

  if (sortedDataList?.length) {
    const init: Record<string, string | number | string[]> = {
      manufacturingDate: formatDateToDDMMYYYY(sortedDataList[0].manufacturingDate)
    }

    paperTypesList?.forEach((typ) => {
      if (typ !== "manufacturingDate") {
        init[typ] = inventory?.find(pr => pr.code === typ)?.weight ?? 0
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
        if (check.array(lastItem["codes"])) {
          lastItem["codes"].push(mo.orderCode)
        }
        else {
          lastItem["codes"] = []
        }
      }
      else {
        const newItem = { ...lastItem }
        newItem["manufacturingDate"] = formatDateToDDMMYYYY(mo.manufacturingDate)
        newItem["codes"] = [mo.orderCode]
        mo.types.forEach((tp) => {
          if (check.number(newItem[tp.type])) newItem[tp.type] = (newItem[tp.type] as number) - tp.weight
        })
        accData.push(newItem)
      }
    }
  })

  return {
    data: accData,
    series: paperTypesList?.map((s, index) => ({ name: s, color: DEFAULT_LINE_COLORS.at(index) })) ?? [],
  }
}

export const CreatePageStoreContext = createContext<Store<CreatePageState> | null>(null);

export default function ManufacturingOrderCreatePageSelectedOrdersDetails() {
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
    return [...set].filter(p => !check.undefined(p)
      && !check.null(p)
      /*
      && (
        (props.type === "FACE") ? (p.split("/").length === 4)
          : (p.split("/").length === 3)
      )
      */
    ) as string[]
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
  }, { skip: paperTypesList.length < 1 });

  const paperUsageChartData = useMemo(() => {
    return compileChartData(moByTypeListResponse?.data, paperTypesList, paperrollsByTypeListResponse?.data)
  }, [moByTypeListResponse, paperrollsByTypeListResponse?.data, paperTypesList])

  const state: CreatePageState = useMemo(() => {
    return {
      draftedMOs: fullDetailMOsResponse?.data,
      facePaperUsage: accumulateMaterialRequirements(fullDetailMOsResponse?.data, "FACE", paperrollsByTypeListResponse?.data),
      rawPaperUsage: accumulateMaterialRequirements(fullDetailMOsResponse?.data, "RAW", paperrollsByTypeListResponse?.data),
      paperUsageChartData,
    }
  }, [fullDetailMOsResponse?.data, paperUsageChartData, paperrollsByTypeListResponse?.data])

  const store = useMemo(() => {
    return new Store<CreatePageState>(state)
  }, [state]);

  if (isFetchingList) {
    return <DataLoading />
  }

  if (fetchError) {
    return <DataFetchError />
  }

  if (!check.greater(fullDetailMOsResponse?.data?.length as number, 0)) {
    return (
      <Center>
        <Box bgColor={"colorPalette.muted"} my={5} px={3} py={2} rounded={"md"} maxW={"20rem"}>
          <Stack alignItems={"center"}>
            <Text textWrap={"wrap"} textAlign={"center"}>Chọn PO Item bên trên để xem trước các lệnh sẽ được tạo</Text>
          </Stack>
        </Box>
      </Center>
    )
  }

  return (
    <CreatePageStoreContext value={store}>
      <Tabs.Root defaultValue="members">
        <Tabs.List>
          <Tabs.Trigger value="members">
            <LuUser />
            Thông tin các lệnh sẽ tạo
          </Tabs.Trigger>
          <Tabs.Trigger value="projects">
            <LuFolder />
            Kiểm tra nguyên phụ liệu
          </Tabs.Trigger>
          <Tabs.Trigger value="tasks">
            <LuSquareCheck />
            Kiểm tra tồn kho hàng
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="members">
          <CreatePageManufacturingOrderTable />
        </Tabs.Content>
        <Tabs.Content value="projects"><MaterialRequirementContainer /></Tabs.Content>
        <Tabs.Content value="tasks">
        </Tabs.Content>
      </Tabs.Root>
    </CreatePageStoreContext>
  );
}
